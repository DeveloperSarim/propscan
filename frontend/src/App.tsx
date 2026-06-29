import { useEffect } from "react";
import { useDerived } from "./store/useDerived";
import { useStore } from "./store/useStore";
import { Home } from "./screens/Home";
import { Results } from "./screens/Results";
import { MapView } from "./screens/MapView";
import { Detail } from "./screens/Detail";
import { Compare } from "./screens/Compare";
import { Dashboard } from "./screens/Dashboard";
import { Post } from "./screens/Post";
import { Calc } from "./screens/Calc";
import { About } from "./screens/About";
import { Contact } from "./screens/Contact";
import { Login } from "./screens/Login";
import { Broker } from "./screens/Broker";
import { AreaGuide } from "./screens/AreaGuide";
import { Market } from "./screens/Market";
import { Shortlist } from "./screens/Shortlist";
import { Legal } from "./screens/Legal";
import { ReportModal } from "./screens/modals/ReportModal";
import { OnboardingModal } from "./screens/modals/OnboardingModal";
import { Widgets } from "./screens/Widgets";
import { ShareModal } from "./screens/ShareModal";
import { CookieBanner } from "./screens/CookieBanner";
import { css } from "./lib/css";

const rootStyle =
  "font-family: Inter, sans-serif; color: #0A0A0A; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: #fff; -webkit-font-smoothing: antialiased; letter-spacing: -0.01em;";

export function App() {
  const D = useDerived();
  const store = useStore();

  useEffect(() => {
    store.fetchCities();
    store.fetchPropertyTypes();
  }, []);

  return (
    <div style={css(rootStyle)}>
      {D.showCookie && <CookieBanner D={D} />}
      {D.isHome && <Home D={D} />}
      {D.isResults && <Results D={D} />}
      {D.isMarket && <Market D={D} />}
      {D.isShortlist && <Shortlist D={D} />}
      {D.isLegal && <Legal D={D} />}
      {D.isArea && <AreaGuide D={D} />}
      {D.isDetail && <Detail D={D} />}
      {D.isMap && <MapView D={D} />}
      {D.isPost && <Post D={D} />}
      {D.isCalc && <Calc D={D} />}
      {D.isDash && <Dashboard D={D} />}
      {D.isCompare && <Compare D={D} />}
      {D.isAbout && <About D={D} />}
      {D.isContact && <Contact D={D} />}
      {D.isLogin && <Login D={D} />}
      {D.isBroker && <Broker D={D} />}
      {D.modalReport && <ReportModal D={D} />}
      {D.modalOnboarding && <OnboardingModal D={D} />}
      {D.showWidgets && <Widgets D={D} />}
      {D.shareOpen && <ShareModal D={D} />}
    </div>
  );
}
