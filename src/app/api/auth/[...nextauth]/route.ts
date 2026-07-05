// ============================================
// InfinityDrive — NextAuth Route Handler
// ============================================
// Destructure GET and POST from the NextAuth handlers.

import { handlers } from '@/lib/auth';

export const GET = handlers.GET;
export const POST = handlers.POST;
