import styled from 'styled-components';
import { AppProviders } from './context/AppProviders';
import { CalendarHeader } from './components/Calendar/CalendarHeader';
import { CalendarGrid } from './components/Calendar/CalendarGrid';
import { SearchBar } from './components/Search/SearchBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorToast } from './components/ErrorToast';
import { GlobalStyles } from './styles/globalStyles';
import { theme } from './styles/theme';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Navbar = styled.nav`
  background: linear-gradient(135deg, ${theme.colors.navbarStart} 0%, ${theme.colors.navbarEnd} 50%, ${theme.colors.navbarStart} 100%);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${theme.shadows.navbar};

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 10px 12px;
  }
`;

const LogoImg = styled.img`
  height: 28px;
`;

const NavTitle = styled.span`
  color: ${theme.colors.textInverse};
  font-size: ${theme.fontSizes.lg};
  font-weight: 500;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 16px 24px;
  background: ${theme.colors.bg};
  overflow-x: auto;

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 12px 8px;
  }
`;

function App() {
  return (
    <AppProviders>
      <GlobalStyles />
      <ErrorBoundary>
        <AppWrapper>
          <Navbar aria-label="Main navigation">
            <LogoImg src="/logo.svg" alt="Addax" />
            <NavTitle>Calendar</NavTitle>
          </Navbar>
          <MainContent aria-label="Calendar content">
            <SearchBar />
            <CalendarHeader />
            <CalendarGrid />
          </MainContent>
        </AppWrapper>
        <ErrorToast />
      </ErrorBoundary>
    </AppProviders>
  );
}

export default App;
