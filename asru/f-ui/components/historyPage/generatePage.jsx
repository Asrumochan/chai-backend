import React, { useState } from 'react';
import { Grid } from '@uhg-abyss/web/ui/Grid';
import { styled } from '@uhg-abyss/web/tools/styled';
import { Text } from '@uhg-abyss/web/ui/Text';
import { Heading } from '@uhg-abyss/web/ui/Heading';
import { Divider } from '@uhg-abyss/web/ui/Divider';
import { StepIndicator } from '@uhg-abyss/web/ui/StepIndicator';
import { useToast } from '@uhg-abyss/web/hooks/useToast';
import { Flex } from '@uhg-abyss/web/ui/Flex';
import StepperSection from '../stepperSection';
import { PAGE_NAME, trainingDocumentUrl } from '../const';
import { useAuthStore } from '../../auth/authStore';
import { Table } from '@uhg-abyss/web/ui/Table';
import { Button } from '@uhg-abyss/web/ui/Button';
import { QuestionsModal } from '../questionsModal';

const StyledText = styled(Text, {
    fontWeight: '700'
});

const StyledGrid = styled(Grid, {
    padding: '20px'
});

const StyledTable = styled(Table, {
    '&.abyss-table-root .abyss-table-head': {
        th: {
            'background-color': '$primary1',
            '.abyss-table-header-cell-container': {
                color: 'white'
            }
        }
    },
    '&.abyss-table-root .abyss-table-body .abyss-table-cell': {
        padding: '15px'
    }
});

const StyledContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    marginTop: '10px'
});

const StyledButton = styled(Button, {
    width: '100%'
});

const LinkDiv = styled('div', {
    cursor: 'pointer',
    color: '#196ECF',
    marginTop: '5px',
    width: '150px'
});

const GeneratePage = () => {
    const { toast } = useToast();
    const userInfo = useAuthStore((state) => state.userInfo);
    const [isModal, setIsModal] = useState(false);

    const columns = [
        { name: 'Group Nmae', key: 'name', isRowHeader: true },
        { name: 'Generate SAMx Template', key: 'type' }
    ];

    const rows = [
        { id: 1, name: 'Creative Solutions Co.', date: '6/7/2020', type: <StyledButton>Download</StyledButton>, rating: 2 },
        {
            id: 2,
            name: 'Green Earth Technologies',
            type: <StyledButton>Download</StyledButton>
        },
        {
            id: 3,
            name: 'Urban Developments LLC',
            type: <StyledButton>Download</StyledButton>
        },
        {
            id: 4,
            name: 'Future Vision Inc.',
            type: <StyledButton>Download</StyledButton>
        }
    ];

        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = trainingDocumentUrl;
            console.log('Downloading training document from:', trainingDocumentUrl);
            link.download = trainingDocumentUrl; // Specify the file name
            link.click();
        };

    return (
        <Flex justify="space-between" direction="column" style={{ height: '90vh', overflow: 'hidden', padding: '10px' }}>
            <StyledGrid>
                <Grid.Col span="80%">
                    <StyledText>Welcome {userInfo.preferredName}!</StyledText>
                    <Heading>Census X-Formatter</Heading>
                    <Text>Standardize input files to census format</Text>
                    <LinkDiv onClick={() => setIsModal(true)}>Have questions?</LinkDiv>
                </Grid.Col>
                <Grid.Col span="20%">
                    <StepIndicator currentStep={3}>
                        <StepIndicator.Step label="Upload File" />
                        <StepIndicator.Step label="History" />
                        <StepIndicator.Step label="Generate SAMx Template" />
                    </StepIndicator>
                </Grid.Col>
                <Divider height={1} />
                <Grid.Col span="100%">
                    <StyledContainer>
                        <StyledText>You have uploaded a file with multiple groups.</StyledText>
                        <Text>For these groups, please select which groups to include in the BUW Template:</Text>
                    </StyledContainer>
                </Grid.Col>
                <Grid.Col span="40%">
                    <StyledTable title="Base Static Table" columns={columns} rows={rows} />
                </Grid.Col>
            </StyledGrid>
            <QuestionsModal isModal={isModal} setIsModal={setIsModal} handleDownload={handleDownload} />
            <StepperSection page={PAGE_NAME.GENERATE} />
        </Flex>
    );
};

export default GeneratePage;
