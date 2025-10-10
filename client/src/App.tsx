import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/pages/LandingPage";
import ProfileSetupPage from "@/pages/ProfileSetupPage";
import OnboardingQuizPage from "@/pages/OnboardingQuizPage";
import DiscoverPage from "@/pages/DiscoverPage";
import EventsPage from "@/pages/EventsPage";
import MatchesPage from "@/pages/MatchesPage";
import ProfilePage from "@/pages/ProfilePage";
import EventDetailPage from "@/pages/EventDetailPage";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const { user, needsProfileSetup, needsVoiceQuiz } = useAuth();

  if (needsProfileSetup) {
    return (
      <Switch>
        <Route path="/onboarding/setup" component={ProfileSetupPage} />
        <Route path="*">
          {() => <Redirect to="/onboarding/setup" />}
        </Route>
      </Switch>
    );
  }

  if (needsVoiceQuiz) {
    return (
      <Switch>
        <Route path="/onboarding/quiz" component={OnboardingQuizPage} />
        <Route path="*">
          {() => <Redirect to="/onboarding/quiz" />}
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DiscoverPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/matches" component={MatchesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/event/:id" component={EventDetailPage} />
      <Route path="/onboarding/quiz" component={OnboardingQuizPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Route path="*" component={LandingPage} />;
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
