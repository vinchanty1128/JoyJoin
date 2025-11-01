import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    needsRegistration: user && !user.hasCompletedRegistration,
    needsInterestsTopics: user && user.hasCompletedRegistration && !user.hasCompletedInterestsTopics,
    needsPersonalityTest: user && user.hasCompletedRegistration && user.hasCompletedInterestsTopics && !user.hasCompletedPersonalityTest,
    needsProfileSetup: user && user.hasCompletedPersonalityTest && !user.hasCompletedProfileSetup,
  };
}
