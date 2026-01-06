import React, { useContext, useEffect } from 'react';
import { DataTable } from '@uhg-abyss/web/ui/DataTable';
import { useDataTable } from '@uhg-abyss/web/hooks/useDataTable';
import { IconSymbol } from '@uhg-abyss/web/ui/IconSymbol';
import '../App.scss';
import { Layout } from '@uhg-abyss/web/ui/Layout';
import { Badge } from '@uhg-abyss/web/ui/Badge';
import { DownloadAction } from './Download_action';
import { useState } from 'react';
import ExcelJS from 'exceljs';
import { styled } from '@uhg-abyss/web/tools/styled';
import { useAuthStore } from '../auth/authStore';
import { Button } from '@uhg-abyss/web/ui/Button';
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../context/RouteContext';

const StyledDataTable = styled(DataTable, {
    '&.abyss-data-table-scroll .abyss-table-header': {
        th: {
            'background-color': '$primary1',
            '.abyss-table-header-data': {
                color: 'white'
            }
        },
        '&.abyss-table-body .abyss-table-cell': {
            padding: '16px 10px'
        }
    }
});

export const Datatable = (props) => {
    const [value, setValue] = useState('');
    const [isFindFile, setIsFindFile] = useState(true);
    const tempData = [];
    const [initData, setInitData] = React.useState([]);
    const isBUW = useAuthStore((state) => state.isBUW);
    const navigate = useNavigate();
    const { basePath } = useContext(RouteContext);

    useEffect(() => {

        // Sort historyData by timestamp in descending order
        const sortedHistoryData = [...props.historyData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (isBUW) {
            sortedHistoryData.forEach((item) => {
                const { InputFileNames, timestamp, status, remarks, userId, outputFileName,isGenerateButton } = item;
                const dateObject = new Date(timestamp);
                const formattedTimestamp =
                    (dateObject.getMonth() + 1).toString().padStart(2, '0') +
                    '/' +
                    dateObject.getDate().toString().padStart(2, '0') +
                    '/' +
                    dateObject.getFullYear() +
                    ' ' +
                    dateObject.toLocaleTimeString();

                // Check if InputFileNames exists and is an array
                if (Array.isArray(InputFileNames)) {
                    InputFileNames.forEach((file) => {
                        tempData.push({
                            fileName: file.fileName || 'N/A', 
                            timestamp: formattedTimestamp,
                            status: status === 'Completed' || status === 'Completed with errors' ? status : 'Errored Out',
                            message: remarks,
                            userId: userId || 'N/A', 
                            actions: {
                                originalFileUrl: file.fileUrl || 'N/A', 
                                formattedFileUrl: outputFileName?.FileUrl || 'N/A', 
                                status: status === 'Completed' || status === 'Completed with errors' ? status : 'Errored Out'
                            },
                            isGenerateButton: isGenerateButton
                        });
                    });
                }
            });
        } else {
            sortedHistoryData.forEach((item, index) => {
                const { originalFileUrl, formattedFileUrl } = item;
                const dateObject = new Date(item.timestamp);
                // Format timestamp as mm/dd/yyyy hh:mm:ss
                const formattedTimestamp =
                    (dateObject.getMonth() + 1).toString().padStart(2, '0') +
                    '/' + // Month
                    dateObject.getDate().toString().padStart(2, '0') +
                    '/' + // Day
                    dateObject.getFullYear() + // Year
                    ' ' +
                    dateObject.toLocaleTimeString(); // Time
                tempData.push({
                    fileName: item.file_name,
                    timestamp: formattedTimestamp,
                    status: item.status === 'Completed' || item.status === 'Completed with errors' ? item.status : 'Errored Out',
                    message: item.remarks,
                    userId: item.userId,
                    actions: {
                        originalFileUrl: item.originalFileUrl,
                        formattedFileUrl: item.formattedFileUrl,
                        status: item.status === 'Completed' || item.status === 'Completed with errors' ? item.status : 'Errored Out'
                    },
                    isGenerateButton: item.isGenerateButton
                });
            });
        }
        dataTableProps.setData(tempData);
        setInitData(tempData);
    }, [props.historyData]);

    const columns = React.useMemo(
        () => [
            {
                Header: 'File Name',
                accessor: 'fileName',
                canToggleVisibilty: false,
                isHiddenByDefault: false,
                canReorderColumn: false,
                minWidth: 150,
                maxWidth: 380,
                Cell: ({ value }) => {
                    return (
                        <Layout.Group>
                            {value}
                        </Layout.Group>
                    );
                }
            },
            {
                Header: 'Timestamp',
                accessor: 'timestamp',
                canToggleVisibilty: false,
                isHiddenByDefault: false,
                canReorderColumn: false,
                minWidth: 130,
                maxWidth: 130
            },
            {
                Header: 'Status',
                accessor: 'status',
                isHiddenByDefault: false,
                canReorderColumn: false,
                minWidth: 140,
                maxWidth: 140,
                Cell: ({ value }) => {
                    let badgeLabel = '';
                    if (value === 'Completed') {
                        badgeLabel = 'success';
                    } else if (value === 'Completed with errors') {
                        badgeLabel = 'warning';
                    } else {
                        badgeLabel = 'error';
                    }
                    return (
                            <Badge variant={badgeLabel}>{value}</Badge>
                    );
                }
            },
            {
                Header: 'Remarks',
                accessor: 'message',
                isHiddenByDefault: false,
                canReorderColumn: false,
                disableSortBy: true,
                label: 'HSA',
                minWidth: 150,
                maxWidth: 150,
                Cell: ({ value }) => {
                    return value;
                }
            },
            {
                Header: 'Owner',
                accessor: 'userId',
                isHiddenByDefault: false,
                canReorderColumn: false,
                disableSortBy: true,
                label: 'HSA',
                minWidth: 60,
                maxWidth: 60,
                Cell: ({ value }) => {
                    return value;
                }
            },
            {
                Header: 'SAMx Template',
                accessor: 'isGenerateButton',
                isHiddenByDefault: false,
                canReorderColumn: false,
                disableSortBy: true,
                minWidth: 90,
                maxWidth: 90,
                Cell: ({ value }) => {
                    return (
                        <Button variant="outline" disabled={!value} onClick={() => navigate(`/${basePath}generatePage`)}>
                            Generate
                        </Button>
                    );
                }
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                isHiddenByDefault: false,
                canReorderColumn: false,
                disableSortBy: true,
                label: 'HSA',
                minWidth: 120,
                maxWidth: 120,
                Cell: ({ value, row }) => {
                    return <DownloadAction props={value} />;
                }
            }
        ],
        []
    );
    const filterTable = () => {
        setIsFindFile(!isFindFile);
        !isFindFile ? setValue('') : null;
        console.log(value, 'value');
        console.log(isFindFile, 'isFindFile');
        dataTableProps.filter.setFilter('fileName', [
            {
                condition: 'contains',
                filterValue: isFindFile ? value : ''
            }
        ]);
    };

    // Function to handle column visibility based on user permissions
    const columnHandler = () => {
        // Check if the user has access to the "SAMx Template" column
        if (!isBUW) {
            // If the user does not have access, filter out the "SAMx Template" column
            return columns.filter((column) => column.Header !== 'SAMx Template');
        } else {
            // If the user has access, return all columns
            // return columns;
            return columns.filter((column) => column.Header !== 'SAMx Template');
        }
    };

    const dataTableProps = useDataTable({
        initialData: initData, // Use initData from state
        initialColumns: columnHandler(),
        uniqueStorageId: 'data-table-local-storage',
        header: false,
        showColumnSort: false,
        showTableSettings: false,
        showColumnVisibilityConfig: false,
        hideTitleHeader: false,
        showTopPagination: false,
        showBottomPagination: true,
        highlightRowOnHover: true,
        showPagination: true,
        pageSizeOptions: [5, 10, 15],
        showGlobalFilter: false,
        showDownloadButton: true,
        removeCsvColumns: ['actions'],
        downloadButtonConfig: {
            removeFiltered: true, // remove "Download filtered dataset (CSV)" option; default is false
            removeFull: true, // remove "Download full dataset (CSV)" option; default is false
            custom: {
                title: 'Export to Excel',
                icon: <IconSymbol icon="file_export" />,
                onClick: () => {
                    handleCustomDownload();
                }
            }
        }
    });
    async function downloadFilteredData(data) {
        let temp = [];

        data.filteredRows.map((item, index) => {
            temp.push({
                fileName: item.original.fileName,
                timestamp: item.original.timestamp,
                status: item.original.status,
                message: item.original.message,
                userId: item.original.userId
            });
        });
        return temp;
    }

    const handleCustomDownload = async () => {
        try {
            let data = await downloadFilteredData(dataTableProps.filter);
            const dataHeaders = { fileName: 'File Name', timestamp: 'Timestamp', status: 'Status', message: 'Remarks', userId: 'Owner' };

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add headers
            worksheet.columns = Object.keys(dataHeaders).map((key) => ({ header: dataHeaders[key], key }));

            // Add rows
            data.forEach((row) => worksheet.addRow(row));

            // Write to buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Create a Blob with the Excel data
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            // Create a link element and trigger download
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Census_X-Formatter_Report_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}_${new Date().toLocaleTimeString().replace(/:/g, '-')}.xlsx`;
            link.click();
        } catch (error) {
            console.error('Error downloading XLSX:', error);
        } finally {
        }
    };

    return (
        <>
            {/* <div style={{ position: 'absolute', top: '130px', left: '85%' }}>
                <Layout.Stack alignLayout="left" alignItems="left" class="flex gap-10">
                    {value === '' ? (
                        <IconSymbol
                            icon="search"
                            style={{
                                position: 'absolute',
                                top: '21px',
                                left: '95%',
                                zIndex: '3',
                                color: 'gray'
                            }}
                        />
                    ) : (
                        <div style={{ visibility: 'hidden' }}></div>
                    )}
                    <TextInput
                        width="940px"
                        label=""
                        placeholder="Search Files..."
                        value={value}
                        isClearable="true"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                filterTable();
                            }
                        }}
                        onChange={(e) => setValue(e.target.value)}
                        onClear={() => {
                            setValue('');
                            filterTable();
                        }}
                        style={{ paddingLeft: 35 }} // Add padding to the left to accommodate the icon
                    />
                </Layout.Stack>
            </div> */}

            <StyledDataTable title="" tableState={dataTableProps} />
        </>
    );
};
