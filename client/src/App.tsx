import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Procedures from "./pages/Procedures";
import ProcedureDetail from "./pages/ProcedureDetail";
import Assistant from "./pages/Assistant";
import Letters from "./pages/Letters";
import Arnaques from "./pages/Arnaques";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import LegalMentions from "./pages/LegalMentions";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalTerms from "./pages/LegalTerms";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/procedures"} component={Procedures} />
      <Route path={"/procedures/:key"} component={ProcedureDetail} />
      <Route path={"/assistant"} component={Assistant} />
      <Route path={"/lettres"} component={Letters} />
      <Route path={"/arnaques"} component={Arnaques} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profil"} component={Profile} />
      <Route path={"/mentions-legales"} component={LegalMentions} />
      <Route path={"/confidentialite"} component={LegalPrivacy} />
      <Route path={"/cgu"} component={LegalTerms} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
