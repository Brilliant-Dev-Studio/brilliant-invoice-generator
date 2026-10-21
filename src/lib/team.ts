export const TEAM_ACCOUNT_LIMIT = 3;
export function assertTeamCapacity(count: number) {
  if (count >= TEAM_ACCOUNT_LIMIT) {
    throw new Error(
      "This company already has 3 team accounts. Suspended accounts also count toward the limit.",
    );
  }
}
