import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PageHeaderPrimitives } from '@uhg-abyss/web/ui/PageHeader';
import { NavMenuPrimitives } from '@uhg-abyss/web/ui/NavMenu';
import { Avatar } from '@uhg-abyss/web/ui/Avatar';
import { IconSymbol } from '@uhg-abyss/web/ui/IconSymbol';
import { getAvatar } from '../utils/misc';
import { RouteContext } from '../context/RouteContext';

export const Navbar = () => {
    const location = useLocation();
    const { basePath } = useContext(RouteContext);

    return (
        <div className="flex col">
            <nav className="flex gap-20 navbar-custom-style">
                <div className="w-full flex">
                    <PageHeaderPrimitives.Container>
                        <div>
                            <PageHeaderPrimitives.Brandmark
                                logoTitle="Census X-Formatter"
                                style={{ color: '#000' }}
                            />
                        </div>
                        <div className={location.pathname !== '/historyPage' && 'nav-container-right'}>
                            <NavMenuPrimitives.Root variant="inverted">
                                {isAuthenticated && sessionStorage.getItem('isReload') === 'false' && (
                                    <NavMenuPrimitives.List>
                                        {/* {location.pathname !== '/historyPage' && (
                                            <NavMenuPrimitives.Link
                                                variant="inverted"
                                                onClick={() => navigate('/historyPage')}
                                            >
                                                History&nbsp;
                                                <IconMaterial size="20px" icon="history" color="$primary1" />
                                            </NavMenuPrimitives.Link>
                                        )} */}
                                        <NavMenuPrimitives.Item>
                                            <NavMenuPrimitives.Trigger variant="inverted">
                                                <Avatar>{getAvatar()}</Avatar>
                                            </NavMenuPrimitives.Trigger>
                                            <NavMenuPrimitives.Content>
                                                <NavMenuPrimitives.Columns>
                                                    <NavMenuPrimitives.Column className="user-dropdown">
                                                        <a href={`/${basePath}logout`}>
                                                            Logout{' '}
                                                            <IconSymbol
                                                                icon="logout"
                                                                size="18"
                                                                style={{ position: 'relative', top: '3px' }}
                                                            />
                                                        </a>
                                                    </NavMenuPrimitives.Column>
                                                </NavMenuPrimitives.Columns>
                                            </NavMenuPrimitives.Content>
                                        </NavMenuPrimitives.Item>
                                    </NavMenuPrimitives.List>
                                )}
                                <NavMenuPrimitives.Viewport />
                            </NavMenuPrimitives.Root>
                        </div>
                    </PageHeaderPrimitives.Container>
                </div>
            </nav>
            
            <div style={{ minHeight: '82vh' }}>
                <Outlet />
            </div>
        </div>
    );
};