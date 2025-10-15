import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import LandingPage from "@/pages/LandingPage";
import RegistrationPage from "@/pages/RegistrationPage";
import PersonalityTestPage from "@/pages/PersonalityTestPage";
import PersonalityTestResultPage from "@/pages/PersonalityTestResultPage";
import ProfileSetupPage from "@/pages/ProfileSetupPage";
import OnboardingQuizPage from "@/pages/OnboardingQuizPage";
import DiscoverPage from "@/pages/DiscoverPage";
import EventsPage from "@/pages/EventsPage";
import ChatsPage from "@/pages/ChatsPage";
import EventChatDetailPage from "@/pages/EventChatDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import EventDetailPage from "@/pages/EventDetailPage";
import BlindBoxPaymentPage from "@/pages/BlindBoxPaymentPage";
import BlindBoxConfirmationPage from "@/pages/BlindBoxConfirmationPage";
import BlindBoxEventDetailPage from "@/pages/BlindBoxEventDetailPage";
import NotFound from "@/pages/not-found";

function RedirectToRegistration() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/registration");
  }, [setLocation]);
  return null;
}

function RedirectToPersonalityTest() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/personality-test");
  }, [setLocation]);
  return null;
}

function RedirectToSetup() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/onboarding/setup");
  }, [setLocation]);
  return null;
}

function RedirectToQuiz() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/onboarding/quiz");
  }, [setLocation]);
  return null;
}

function AuthenticatedRouter() {
  const { needsRegistration, needsPersonalityTest, needsProfileSetup, needsVoiceQuiz } = useAuth();

  if (needsRegistration) {
    return (
      <Switch>
        <Route path="/registration" component={RegistrationPage} />
        <Route path="*" component={RedirectToRegistration} />
      </Switch>
    );
  }

  if (needsPersonalityTest) {
    return (
      <Switch>
        <Route path="/personality-test" component={PersonalityTestPage} />
        <Route path="/personality-test/results" component={PersonalityTestResultPage} />
        <Route path="*" component={RedirectToPersonalityTest} />
      </Switch>
    );
  }

  if (needsProfileSetup) {
    return (
      <Switch>
        <Route path="/onboarding/setup" component={ProfileSetupPage} />
        <Route path="*" component={RedirectToSetup} />
      </Switch>
    );
  }

  if (needsVoiceQuiz) {
    return (
      <Switch>
        <Route path="/onboarding/quiz" component={OnboardingQuizPage} />
        <Route path="*" component={RedirectToQuiz} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={DiscoverPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/blindbox/payment" component={BlindBoxPaymentPage} />
      <Route path="/blindbox/confirmation" component={BlindBoxConfirmationPage} />
      <Route path="/blind-box-events/:eventId" component={BlindBoxEventDetailPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/chats" component={ChatsPage} />
      <Route path="/chats/:eventId" component={EventChatDetailPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/event/:id" component={EventDetailPage} />
      <Route path="/onboarding/quiz" component={OnboardingQuizPage} />
      <Route path="/personality-test/results" component={PersonalityTestResultPage} />
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
