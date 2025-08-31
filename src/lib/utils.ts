import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for Safegal

/**
 * Rate limiting utility
 * Allows up to 3 cases per 24h; minimum 10 minutes between; soft block after >5 unfounded in 30 days
 */
export async function rateLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  nextAllowedAt?: Date;
  alertsToday: number;
  isSoftBlocked: boolean;
}> {
  const { data: rateLimitData, error } = await supabase
    .from('user_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to check rate limit');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Initialize rate limit record if it doesn't exist
  if (!rateLimitData) {
    const { error: insertError } = await supabase
      .from('user_rate_limits')
      .insert({
        user_id: userId,
        alerts_today: 0,
        unfounded_count: 0,
        is_soft_blocked: false
      });
    
    if (insertError) throw new Error('Failed to initialize rate limit');
    
    return { allowed: true, alertsToday: 0, isSoftBlocked: false };
  }

  // Check soft block (more than 5 unfounded in 30 days)
  if (rateLimitData.is_soft_blocked) {
    return {
      allowed: false,
      reason: 'Account temporarily restricted due to multiple unfounded reports',
      alertsToday: rateLimitData.alerts_today,
      isSoftBlocked: true
    };
  }

  // Check daily limit (3 per day)
  if (rateLimitData.alerts_today >= 3) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      allowed: false,
      reason: 'Daily limit of 3 reports reached',
      nextAllowedAt: tomorrow,
      alertsToday: rateLimitData.alerts_today,
      isSoftBlocked: false
    };
  }

  // Check minimum interval (10 minutes)
  if (rateLimitData.last_alert_at) {
    const lastAlert = new Date(rateLimitData.last_alert_at);
    const timeSinceLastAlert = now.getTime() - lastAlert.getTime();
    const minInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (timeSinceLastAlert < minInterval) {
      const nextAllowed = new Date(lastAlert.getTime() + minInterval);
      return {
        allowed: false,
        reason: 'Please wait 10 minutes between reports',
        nextAllowedAt: nextAllowed,
        alertsToday: rateLimitData.alerts_today,
        isSoftBlocked: false
      };
    }
  }

  return {
    allowed: true,
    alertsToday: rateLimitData.alerts_today,
    isSoftBlocked: false
  };
}

/**
 * Write audit log entry with hash chaining
 */
export async function writeAudit(event: {
  caseId?: string;
  eventType: string;
  actorId?: string;
  details: any;
}): Promise<{ ok: boolean; newHash: string }> {
  try {
    // Get the previous hash from case_actions
    const { data: lastAction } = await supabase
      .from('case_actions')
      .select('action_hash')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const prevHash = lastAction?.action_hash || '0000000000000000000000000000000000000000000000000000000000000000';
    
    // Create event JSON
    const eventJson = {
      ...event,
      timestamp: new Date().toISOString(),
      prevHash
    };

    // Calculate new hash
    const eventString = JSON.stringify(eventJson);
    const encoder = new TextEncoder();
    const data = encoder.encode(prevHash + eventString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const newHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert case action entry
    const { error } = await supabase
      .from('case_actions')
      .insert({
        case_id: event.caseId || '',
        action_type: 'created' as any, // Default action type
        actor_id: event.actorId || '',
        details: event.details || {},
        prev_hash: prevHash,
        action_hash: newHash
      });

    if (error) throw error;

    return { ok: true, newHash };
  } catch (error) {
    console.error('Audit write failed:', error);
    return { ok: false, newHash: '' };
  }
}

/**
 * Detect spike in risk tags within 48 hours
 */
export async function detectSpike(countyId: string, tagCountsLast48h: Record<string, number>): Promise<boolean> {
  // Check if any tag appears 3 or more times in the last 48 hours
  return Object.values(tagCountsLast48h).some(count => count >= 3);
}

/**
 * Rank alert based on age band, risk tags, and redacted note
 * Returns score 0-100 and reasons
 */
export function rankAlert(payload: {
  ageBand: string;
  riskTags: string[];
  redactedNote?: string;
}): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  // Age band scoring
  switch (payload.ageBand) {
    case '10-12':
      score += 20;
      reasons.push('Younger age group (higher risk)');
      break;
    case '13-15':
      score += 35;
      reasons.push('Critical age group (highest risk)');
      break;
    case '16-17':
      score += 10;
      reasons.push('Older age group (moderate risk)');
      break;
  }

  // Risk tags scoring
  if (payload.riskTags.includes('upcoming_ceremony')) {
    score += 30;
    reasons.push('Upcoming ceremony detected');
  }
  if (payload.riskTags.includes('pressure_at_home')) {
    score += 25;
    reasons.push('Family pressure indicators');
  }
  if (payload.riskTags.includes('travel_plan')) {
    score += 20;
    reasons.push('Sudden travel plans');
  }
  if (payload.riskTags.includes('injury_signs')) {
    score += 35;
    reasons.push('Signs of injury or pain');
  }
  if (payload.riskTags.includes('community_rumor')) {
    score += 15;
    reasons.push('Community rumors detected');
  }

  // Note length scoring (more detail = higher concern)
  if (payload.redactedNote) {
    const noteScore = Math.min(20, payload.redactedNote.length / 10);
    score += noteScore;
    if (noteScore > 10) {
      reasons.push('Detailed report provided');
    }
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  return { score, reasons };
}

/**
 * Generate case code in format SG-<County3>-<Base36ID>
 */
export function generateCaseCode(countyCode: string): string {
  const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SG-${countyCode.substring(0, 3).toUpperCase()}-${randomId}`;
}

/**
 * Get trust seal data
 */
export async function getTrustSeal(): Promise<{
  latestHash: string;
  monthActionCount: number;
}> {
  try {
    // Get latest hash from case_actions
    const { data: latestAction } = await supabase
      .from('case_actions')
      .select('action_hash')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get action count for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthActionCount } = await supabase
      .from('case_actions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return {
      latestHash: latestAction?.action_hash || '0000000000000000000000000000000000000000000000000000000000000000',
      monthActionCount: monthActionCount || 0
    };
  } catch (error) {
    console.error('Failed to get trust seal:', error);
    return {
      latestHash: '0000000000000000000000000000000000000000000000000000000000000000',
      monthActionCount: 0
    };
  }
}

/**
 * Get public stats by aggregating case data by county
 */
export async function getPublicStats() {
  try {
    // Get all counties
    const { data: counties, error: countiesError } = await supabase
      .from('counties')
      .select('id, code, name');

    if (countiesError) {
      console.error('Failed to get counties:', countiesError);
      return [];
    }

    // Create mock stats for now - replace with actual aggregation queries when needed
    return (counties || []).map(county => ({
      county_code: county.code,
      county_name: county.name,
      new_this_week: Math.floor(Math.random() * 20),
      in_progress: Math.floor(Math.random() * 15),
      closed_this_month: Math.floor(Math.random() * 50),
      ack_under_4h_percent: Math.floor(Math.random() * 100),
      first_action_under_24h_percent: Math.floor(Math.random() * 100)
    }));
  } catch (error) {
    console.error('Failed to get public stats:', error);
    return [];
  }
}

/**
 * Format time difference for display
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return target.toLocaleDateString();
}

/**
 * Get risk level color based on score
 */
export function getRiskLevelColor(score: number): string {
  if (score >= 80) return 'destructive';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'default';
  return 'secondary';
}

/**
 * Get risk level text based on score
 */
export function getRiskLevelText(score: number): string {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}
