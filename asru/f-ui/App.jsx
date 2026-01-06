import { useEffect } from 'react';
import './App.scss';
import { Routes, Route, BrowserRouter as Router, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout';
import ProtectedRoute from './auth/ProtectedRoute';
import { ActiveStepProvider } from './components/context/ActiveStepContext';
import { ToastProvider } from '@uhg-abyss/web/ui/Toast';
import { ThemeProvider } from '@uhg-abyss/web/ui/ThemeProvider';
import { createTheme } from '@uhg-abyss/web/tools/theme';
import UpdatedHistory from './components/historyPage/updatedHistory';
import GeneratePage from './components/historyPage/generatePage';
import { RouteProvider } from './context/RouteContext';
import NoMatch from './components/nomatch';

function App() {
    const navigate = useNavigate();
    const theme = createTheme('uhc');
    useEffect(() => {
        const [navigationEntry] = performance.getEntriesByType('navigation');
        sessionStorage.setItem('isReload', 'false');
        if (navigationEntry && navigationEntry.type === 'reload') {
            sessionStorage.setItem('isReload', 'true');
            console.log('Page was reloaded');
        } else {
            console.log('Page was not reloaded');
        }
    }, [navigate]);

    return (
        <ThemeProvider theme={theme}>
            <ToastProvider position={'top-right'} />
            <ActiveStepProvider>
                <Routes>
                    <Route path={``}>
                        <Route
                            index
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path={`historyPage`}
                            element={
                                <ProtectedRoute>
                                    {/* <HistoryPage /> */}
                                    <UpdatedHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route path={`generatePage`} element={<GeneratePage />}></Route>
                        <Route path="*" element={<NoMatch />} />
                    </Route>
                </Routes>
                {/* <Footer /> */}
            </ActiveStepProvider>
        </ThemeProvider>
    );
}

const AppWrapper = ({ basePath = '', userInfoHost = {}, censusFile = [], censusAPIData = [], isLingoChatApiCalling = false, isDisableBUWSelection = false, isNewChat = false, setIsNewChat }) => {
    return (
        <RouteProvider
            basePath={basePath}
            userInfoHost={userInfoHost}
            censusFile={censusFile}
            censusAPIData={censusAPIData}
            isLingoChatApiCalling={isLingoChatApiCalling}
            isDisableBUWSelection={isDisableBUWSelection}
            isNewChat={isNewChat}
            setIsNewChat={setIsNewChat}
        >
            <App />
        </RouteProvider>
    );
};

export default AppWrapper;
