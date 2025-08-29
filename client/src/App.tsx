import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import Home from "@/pages/home";
import Flashcards from "@/pages/flashcards";
import MemoryGame from "@/pages/memory-game";
import Quiz from "@/pages/quiz";
import Pronunciation from "@/pages/pronunciation";
import BossQuiz from "@/components/boss-quiz";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/memory-game" component={MemoryGame} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/pronunciation" component={Pronunciation} />
        <Route path="/boss-quiz" component={BossQuiz} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
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
