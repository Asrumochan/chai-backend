import { Box } from '@uhg-abyss/web/ui/Box';
import { Text } from '@uhg-abyss/web/ui/Text';
import { Badge } from '@uhg-abyss/web/ui/Badge';
import { Card } from '@uhg-abyss/web/ui/Card';
import { IconMaterial } from '@uhg-abyss/web/ui/IconMaterial';
import { useState } from 'react';
import '.././App.scss';

export const History = ({ user_history }) => {
    // State for filtered history
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    if (user_history) {
        user_history.message = user_history?.message?.map((element) => {
            return { ...element, isPopup: false };
        });
    }

    const [selectedFileFormattedUrl, setSelectedFileFormattedUrl] = useState('');
    const [selectedFileOriginalUrl, setSelectedFileOriginalUrl] = useState('');
    // Group history items by date
    const groupedHistory = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: []
    };

    user_history?.message?.forEach((item) => {
        const itemDate = new Date(item.timestamp);

        if (itemDate.toDateString() === today.toDateString()) {
            groupedHistory.today.unshift(item); // Use unshift to add at the beginning
        } else if (itemDate.toDateString() === yesterday.toDateString()) {
            groupedHistory.yesterday.unshift(item); // Use unshift to add at the beginning
        } else if (itemDate >= thisWeekStart) {
            groupedHistory.thisWeek.unshift(item); // Use unshift to add at the beginning
        } else {
            groupedHistory.older.unshift(item); // Use unshift to add at the beginning
        }
    });

    const HistoryItem = ({ item }) => {
        const [showDownloadPopup, setShowDownloadPopup] = useState(false);

        const handleDownloadClick = () => {
            // if (item.status === "Completed") {
            setShowDownloadPopup(!showDownloadPopup);
            // }
            // else {
            //    prompt("File is not yet converted. Do you want to download the original file?", item.originalFileUrl);
            // }
        };
        return (
            <Card key={item._id} className="history-card">
                <Card.Section className="history-card-section">
                    <div className="flex space-between history-card-content">
                        <div class="flex " style={{ gap: '25px' }}>
                            <IconMaterial icon="article" color="$blue" size="24px" />
                        </div>

                        <div style={{ width: '120px' }}>
                            <div style={{ wordBreak: 'break-word' }}>{item.file_name}</div>
                            <div>
                                {new Date(item.timestamp).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </div>
                            <div>
                                {/* Conditional rendering of Badge */}
                                {item.status === 'Completed' || item.status === 'Completed with errors' ? (
                                    <Badge variant={item.status === 'Completed' ? 'success' : 'warning'}>{item.status}</Badge>
                                ) : (
                                    <Badge variant="error">Errored Out</Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex  align-center" style={{ gap: '25px' }}>
                            <a href="#" onClick={handleDownloadClick}>
                                <IconMaterial icon="file_download" />
                            </a>
                        </div>
                    </div>
                </Card.Section>

                {showDownloadPopup && (
                    <div
                        style={{
                            width: '132px',
                            marginLeft: '58%',
                            marginTop: '-15px',
                            marginBottom: ' 10px',
                            fontSize: '14px'
                        }}
                    >
                        <div className="download-popup">
                            <button
                                onClick={() => {
                                    window.location.href = item.originalFileUrl;
                                }}
                            >
                                Original File
                            </button>
                            {(item.status === 'Completed' || item.status === 'Completed with errors') && (
                                <button
                                    onClick={() => {
                                        window.location.href = item.formattedFileUrl;
                                    }}
                                >
                                    Converted File
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        );
    };
    return (
        <>
            {user_history?.message?.length === 0 ? (
                <div className="history-container history-header side-nav-bar-border-radius">No History </div>
            ) : (
                <div className="history-container side-nav-bar-border-radius">
                    <div className="history-header">
                        <h4 size="lg" weight="bold">
                            History
                        </h4>
                    </div>
                    {/* Today's History */}
                    {groupedHistory.today.length > 0 && (
                        <div className="history-section">
                            <div>Today</div>
                            {groupedHistory.today.map((item, index) => (
                                <HistoryItem key={index} item={item} />
                            ))}
                            {/* {groupedHistory.today.length > 3 && (
                <a href="#" className="view-all-link">View All</a>
              )} */}
                        </div>
                    )}

                    {/* Yesterday's History */}
                    {groupedHistory.yesterday.length > 0 && (
                        <div className="history-section">
                            <div>Yesterday</div>
                            {groupedHistory.yesterday.map((item, index) => (
                                <HistoryItem key={index} item={item} />
                            ))}
                            {/* {groupedHistory.yesterday.length > 3 && (
                <a href="#" className="view-all-link">View All</a>
              )} */}
                        </div>
                    )}

                    {/* This week's History */}
                    {groupedHistory.thisWeek.length > 0 && (
                        <div className="history-section">
                            <div>This Week</div>
                            {groupedHistory.thisWeek.map((item, index) => (
                                <HistoryItem key={index} item={item} />
                            ))}
                            {/* {groupedHistory.thisWeek.length > 3 && (
                <a href="#" className="view-all-link">View All</a>
              )} */}
                        </div>
                    )}

                    {/* Older history */}
                    {groupedHistory.older.length > 0 && (
                        <div className="history-section">
                            <div>Older</div>
                            {groupedHistory.older.map((item, index) => (
                                <HistoryItem key={index} item={item} />
                            ))}
                            {/* {groupedHistory.older.length > 3 && (
                <a href="#" className="view-all-link">View All</a>
              )} */}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
