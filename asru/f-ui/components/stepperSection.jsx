'use client';
import { styled } from '@uhg-abyss/web/tools/styled';
import { Button } from '@uhg-abyss/web/ui/Button';
import { Flex } from '@uhg-abyss/web/ui/Flex';
import { Text } from '@uhg-abyss/web/ui/Text';
import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { PAGE_NAME } from './const';
import { IconSymbol } from '@uhg-abyss/web/ui/IconSymbol';
import { RouteContext } from '../context/RouteContext';
import WithConditional from '../hoc/WithConditional';
import { tellParentToResetData } from './uploadFilePage/helper';

const StyledText = styled(Text, {
    fontWeight: 700
});

const StyledFlex = styled(Flex, {
    padding: '10px',
    alignItems: 'center',
    backgroundColor: 'white'
});

const StepperSection = (props) => {
    const { page, uploadData = { fileList: [], activeStep: -1 }, uploadState, formatInUHC } = props;
    const [isHistoryPage, setIsHistoryPage] = useState(false);
    const [isUploadFilePage, setIsUploadFilePage] = useState(false);
    const [isGeneratePage, setGeneratePage] = useState(false);
    const { basePath, isLingoChatApiCalling } = useContext(RouteContext);

    useEffect(() => {
        if (page === PAGE_NAME.HISTORY) {
            setIsHistoryPage(true);
            setIsUploadFilePage(false);
            setGeneratePage(false);
        }
        if (page === PAGE_NAME.UPLOAD_FILE) {
            setIsUploadFilePage(true);
            setGeneratePage(false);
            setIsHistoryPage(false);
        }
        if (page === PAGE_NAME.GENERATE) {
            setGeneratePage(true);
            setIsUploadFilePage(false);
            setIsHistoryPage(false);
        }
    }, [page]);

    return (
        // style={{ zIndex: '100', backgroundColor: 'white', width: '100vw', position: 'fixed', left: '0', bottom: '0', padding: '8px 16px', boxShadow: '0px -2px 4px 0px rgba(0, 0, 0, 0.2)' }}
        <StyledFlex justify="space-between">
            <Link to={`/`}>
                <StyledText color="'#196ECF'">Close & return to home</StyledText>
            </Link>
            <WithConditional when={isHistoryPage}>
                <Link
                    to={`/${basePath}`}
                    onClick={() => {
                        tellParentToResetData();
                    }}
                >
                    <Button>New File Upload</Button>
                </Link>
            </WithConditional>
            <WithConditional when={isGeneratePage}>
                <Link to={`/${basePath}historyPage`}>
                    <Button variant="outline">Return to File History</Button>
                </Link>
            </WithConditional>
            <WithConditional when={isUploadFilePage}>
                <Button
                    after={<IconSymbol icon="arrow_forward" />}
                    isDisabled={uploadState === 'inProgress' || !uploadData.fileList.length || isLingoChatApiCalling}
                    onClick={() => {
                        formatInUHC();
                        uploadData.activeStep = 1;
                    }}
                >
                    Continue
                </Button>
            </WithConditional>
        </StyledFlex>
    );
};

export default StepperSection;
