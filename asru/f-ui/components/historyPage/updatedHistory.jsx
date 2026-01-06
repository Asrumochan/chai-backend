import React, { useContext, useState } from 'react';
import { Grid } from '@uhg-abyss/web/ui/Grid';
import { ToggleTabs } from '@uhg-abyss/web/ui/ToggleTabs';
import { styled } from '@uhg-abyss/web/tools/styled';
import { DateInputRange } from '@uhg-abyss/web/ui/DateInputRange';
import { Text } from '@uhg-abyss/web/ui/Text';
import { Heading } from '@uhg-abyss/web/ui/Heading';
import { Divider } from '@uhg-abyss/web/ui/Divider';
import { StepIndicator } from '@uhg-abyss/web/ui/StepIndicator';
import { TextInput } from '@uhg-abyss/web/ui/TextInput';
import { Tabs } from '@uhg-abyss/web/ui/Tabs';
import { encryptQueryParams, getMsIdandIsAdmin } from '../../utils/misc';
import { useEffect } from 'react';
import axios from 'axios';
import { Datatable } from '../../utils/Datatable';
import { useToast } from '@uhg-abyss/web/hooks/useToast';
import { Flex } from '@uhg-abyss/web/ui/Flex';
import StepperSection from '../stepperSection';
import { LoadingSpinner } from '@uhg-abyss/web/ui/LoadingSpinner';
import { CONVERT_STATUS, PAGE_NAME, trainingDocumentUrl } from '../const';
import { useAuthStore } from '../../auth/authStore';
import WithConditional from '../../hoc/WithConditional';
import { RouteContext } from '../../context/RouteContext';
import { getToastConfig, tellParentToResetData } from '../uploadFilePage/helper';
import { useNavigate } from 'react-router-dom';
import { QuestionsModal } from '../questionsModal';

const StyledDiv = styled('div', {
    padding: '10px'
});

const StyledText = styled(Text, {
    fontWeight: '700'
});

const StyledGrid = styled(Grid, {
    padding: '5px'
});
const LoadingSpinnerContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
});

const LinkDiv = styled('div', {
    cursor: 'pointer',
    color: '#196ECF',
    width: '150px'
});

const UpdatedHistory = () => {
    const [userHistory, setuserHistory] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0); // Initial tab (All Files)
    const [selectedDateFilter, setSelectedDateFilter] = useState(0); // Tracks the date filter (Today)
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const currentDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const [dateRange, setDateRange] = useState({ from: currentDate, to: currentDate });
    const { toast } = useToast();
    const userInfo = useAuthStore((state) => state.userInfo);
    const isBUW = useAuthStore((state) => state.isBUW);
    const { censusAPIData, isNewChat, setIsNewChat, basePath, isLingoChatApiCalling } = useContext(RouteContext);
    const [isModal, setIsModal] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const { msId, isAdmin } = getMsIdandIsAdmin();
            const encodedParams = encryptQueryParams(`msId=${msId}&isAdmin=${isAdmin}`);
            let response;

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const apiUrl = isBUW ? `${import.meta.env.VITE_BACKEND_PY_URL_BUW}/getHistory` : `${import.meta.env.VITE_BACKEND_EXPRESS_URL}/user_history?params=${encodedParams}`;

            response = await axios({
                url: apiUrl,
                method: isBUW ? 'POST' : 'GET',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
                },
                ...(isBUW && { data: { teamName: 'BUW' } })
            });

            if (response) {
                const historyData = isBUW ? response.data.history : response.data.message;
                setuserHistory(
                    historyData
                        .filter((item) => {
                            if (isBUW) {
                                const buwFilter = item.InputFileNames;
                                const adminFilter = isAdmin || item.userId === msId;
                                return buwFilter && adminFilter;
                            } else {
                                return true;
                            }
                        })
                        .map((item) => ({ ...item, isPopup: false }))
                );
            } else {
                toast.show({
                    title: 'Error',
                    message: 'Error Occurred during fetching the history',
                    variant: 'error',
                    autoClose: 3000
                });
            }
        } catch (error) {
            toast.show({
                title: 'Error',
                message: 'Error Occured during retrieving the history',
                variant: 'error',
                autoClose: 3000
            });
            console.error('Error in retrieving history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [censusAPIData]);

    useEffect(() => {
        if (isNewChat) {
            navigate(`/${basePath}`);
            tellParentToResetData();
            setIsNewChat(false);
        }
    }, [isNewChat]);

    // Filter functions
    const filterToday = () => {
        const today = new Date();
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0); // Start of today
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999); // End of today

        return userHistory.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= todayStart && itemDate <= todayEnd;
        });
    };

    const filterLastWeek = () => {
        const today = new Date();
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7); // 7 days ago
        lastWeekStart.setHours(0, 0, 0, 0); // Start of the day
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999); // End of today

        return userHistory.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= lastWeekStart && itemDate <= todayEnd;
        });
    };

    const filterLastMonth = () => {
        const today = new Date();
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1); // 1 month ago
        lastMonthStart.setHours(0, 0, 0, 0); // Start of the day
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999); // End of today

        return userHistory.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= lastMonthStart && itemDate <= todayEnd;
        });
    };

    const filterDateRange = () => {
        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return userHistory.filter((item) => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    };

    const completed = (data) => {
        return data.filter((item) => item.status === 'Completed' || item.status === 'Completed with errors');
    };

    const error = (data) => {
        return data.filter((item) => item.status === 'InCompleted');
    };

    useEffect(() => {
        <Datatable filteredHistory={filteredHistory} />;
    }, [filteredHistory]);

    // Updated filtering logic to use selectedDateFilter and search
    useEffect(() => {
        let filteredData = userHistory; // Start with all data

        // Apply the selected date filter first
        switch (selectedDateFilter) {
            case 0:
                filteredData = filterToday();
                break;
            case 1:
                filteredData = filterLastWeek();
                break;
            case 2:
                filteredData = filterLastMonth();
                break;
            case 3:
                filteredData = filterDateRange();
                break;
            default:
                break;
        }

        // Apply the selected tab filter
        if (selectedTab === 1) {
            filteredData = completed(filteredData);
        } else if (selectedTab === 2) {
            filteredData = error(filteredData);
        }

        // Apply search filter (if searchValue is not empty)
        if (searchQuery) {
            filteredData = filteredData.filter((item) => {
                return item.file_name.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }

        setFilteredHistory(filteredData);
    }, [selectedTab, userHistory, selectedDateFilter, dateRange, searchQuery]);

    const handleDateInputChange = (newValues) => {
        setDateRange(newValues);
        setSelectedDateFilter(3); // Set to "Selected Range"
    };

    const handleSearch = () => {
        setSearchQuery(searchText);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = trainingDocumentUrl;
        link.download = trainingDocumentUrl; // Specify the file name
        link.click();
    };

    return (
        <Flex justify="space-between" direction="column" style={{ padding: '10px', overflow: 'hidden', minHeight: '90vh' }}>
            <StyledGrid>
                <Grid.Col span="80%">
                    <StyledText>Welcome {userInfo.preferredName}!</StyledText>
                    <Heading>Census X-Formatter</Heading>
                    <Text>Browse processed file history</Text>
                    <LinkDiv onClick={() => setIsModal(true)}>Have questions?</LinkDiv>
                </Grid.Col>
                <Grid.Col span="20%">
                    <StepIndicator currentStep={2}>
                        <StepIndicator.Step label="Upload File" />
                        <StepIndicator.Step label="History" />
                    </StepIndicator>
                </Grid.Col>
                <Divider height={1} />
                <Grid.Col span="30%"></Grid.Col>
                <Grid.Col span="70%">
                    <Heading>History</Heading>
                    <TextInput
                        width="95%"
                        type="search"
                        placeholder="Search Files..."
                        isClearable
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onClear={() => {
                            setSearchText('');
                            setSearchQuery('');
                        }}
                        onClickSearch={handleSearch}
                    ></TextInput>
                </Grid.Col>
                <Grid.Col span="30%">
                    <StyledDiv>
                        <ToggleTabs label="Date Filter Options" onChange={(e) => setSelectedDateFilter(Number(e.target.value))} value={selectedDateFilter.toString()} fullWidth>
                            <ToggleTabs.Tab label="Today" value="0" />
                            <ToggleTabs.Tab label="Last Week" value="1" />
                            <ToggleTabs.Tab label="Last Month" value="2" />
                        </ToggleTabs>
                    </StyledDiv>
                    <StyledDiv>
                        <StyledText>Select Date Range</StyledText>
                        <DateInputRange subText="" startDateLabel="" endDateLabel="" label="DateInputRange Sandbox" width="100%" values={dateRange} onChange={handleDateInputChange} />
                    </StyledDiv>
                </Grid.Col>
                <WithConditional when={!isLoading && !isLingoChatApiCalling}>
                    <Grid.Col span="70%" style={{ overflowY: 'auto', height: '50vh' }}>
                        <Tabs variant="line" onTabChange={setSelectedTab}>
                            {[
                                { label: 'All Files', value: '0' },
                                { label: 'Completed', value: '1' },
                                { label: 'Errors', value: '2' }
                            ].map((tab) => (
                                <Tabs.Tab key={tab.value} label={tab.label} value={tab.value}>
                                    <Datatable historyData={filteredHistory} />
                                </Tabs.Tab>
                            ))}
                        </Tabs>
                    </Grid.Col>
                </WithConditional>
                <WithConditional when={isLoading || isLingoChatApiCalling}>
                    <Grid.Col span="70%">
                        <LoadingSpinnerContainer>
                            <LoadingSpinner size="100px" isLoading={isLoading || isLingoChatApiCalling} />
                            <Text color="#002677">Please wait while loading ... </Text>
                        </LoadingSpinnerContainer>
                    </Grid.Col>
                </WithConditional>
            </StyledGrid>
            <QuestionsModal isModal={isModal} setIsModal={setIsModal} handleDownload={handleDownload} />
            <StepperSection page={PAGE_NAME.HISTORY} />
        </Flex>
    );
};

export default UpdatedHistory;
