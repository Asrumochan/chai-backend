import { Tabs } from "@abyss/web/ui/Tabs";
import { DateInput } from "@abyss/web/ui/DateInput";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Card } from "@abyss/web/ui/Card";
import { IconMaterial } from "@abyss/web/ui/IconMaterial";
import { Badge } from "@abyss/web/ui/Badge";
import ".././App.scss";
import "./historyPage.scss";
import { Text } from "@abyss/web/ui/Text";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "@abyss/web/ui/LoadingSpinner";
import { DateInputRange } from "@abyss/web/ui/DateInputRange";
import { Button } from "@abyss/web/ui/Button";
import { SearchInput } from "@abyss/web/ui/SearchInput";
import { Datatable } from "../utils/Datatable";
import { RouteContext } from "../context/RouteContext";
// import * as utils from '@uhg-abyss/web/ui/utils';

export const HistoryPage = () => {
  const [user_history, setUser_history] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [value, setValue] = useState(null); // Not used for now
  const [selectedTab, setSelectedTab] = useState(0); // Initial tab (All Files)
  const [filteredHistory, setFilteredHistory] = useState([]);
  const today1 = new Date();
  const formattedToday = today1.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }); // YYYY-MM-DD
  const [values, setValues] = useState({
    from: formattedToday, // Set "from" to today
    to: formattedToday, // Set "to" to today
  });
  const [selectedDateFilter, setSelectedDateFilter] = useState(0); // Tracks the date filter (Today)
  const [searchValue, setSearchValue] = useState(""); // State for search input
  const { basePath } = useContext(RouteContext);
  // ... (Your handleSearch function) ...

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios({
          url: "https://qrt-stage-formatter-express.hcck8s-ctc-np101.optum.com/user_history",
          method: "GET",
        });
        if (response) {
          console.log("response", response.data);
          // Add isPopup: false to each item
          response.data.message = response.data.message.map((item) => ({
            ...item,
            isPopup: false,
          }));
          // Append new data to the beginning of the array
          setUser_history(response.data.message);
          console.log("user_history", user_history);
        }
      } catch (error) {
        console.error("Error in retrieving history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  // Filtering functions
  // ... (your filtering functions) ...
  const allFiles = (data) => {
    return data; // Just return all data
  };

  const sortByDateDescending = (a, b) => {
    const aDate = new Date(a.timestamp);
    const bDate = new Date(b.timestamp);
    return bDate - aDate; // Descending order
  };

  // Redefined grouping and sorting functions
  const today = () => {
    const today = new Date();
    return user_history
      ?.filter((item) => {
        const itemDate = new Date(item.timestamp);
        return itemDate.toDateString() === today.toDateString();
      })
      .sort(sortByDateDescending); // Sort by date descending
  };

  const lastWeek = () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    console.log(user_history,"user histroy")
    // Calculate last week's start date correctly:
    lastWeekStart.setDate(lastWeekStart.getDate() - (lastWeekStart.getDay() + 7)); 
    return user_history?.filter((item) => {
      const itemDate = new Date(item.timestamp);
      // Filter for dates between lastWeekStart (inclusive) and today (exclusive)
      return itemDate >= lastWeekStart && itemDate < today;
    }).sort(sortByDateDescending); // Sort by date descending
  };
  const lastMonth = () => {
    const today = new Date();
    const lastMonthStart = new Date(today);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1); // Set to the first day of the previous month
    return user_history?.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= lastMonthStart && itemDate < today;
    }).sort(sortByDateDescending);
  };
  const completed = (data) => {
    return data.filter((item) => (item.status === "Completed" || item.status==="Completed with errors") );
  };

  const error = (data) => {
    return data.filter((item) => item.status === "InCompleted");
  };
  const handleSearch = (data) => {
    // You can use data.value
    setSearchValue(data.value); // Update the state for filtering
  };
  // Updated filtering logic to use selectedDateFilter and search
  useEffect(() => {
    let filteredData = user_history; // Start with all data

    // Apply the selected date filter first
    switch (selectedDateFilter) {
      case 0:
        filteredData = today();
        console.log(filteredData,"today")
        break;
      case 1:
        filteredData = lastWeek();
        console.log(filteredData,"lastWeek")
        break;
      case 2:
        filteredData = lastMonth();
        console.log(filteredData,"lastMonth")
        break;
      case 3:
        filteredData = user_history?.filter((item) => {
          const itemDate = new Date(item.timestamp);
          return (
            itemDate >= new Date(values.from) && itemDate <= new Date(values.to)
          );
        });console.log("dsfvxc",filteredData)
        break;
      default:
        break;
    }

    // Apply the selected tab filter next
    switch (selectedTab) {
      case 0:
        filteredData = allFiles(filteredData);
        break;
      case 1:
        filteredData = completed(filteredData);
        break;
      case 2:
        filteredData = error(filteredData);
        break;
      default:
        break;
    }

    // Apply search filter (if searchValue is not empty)
    if (searchValue) {
      filteredData = filteredData.filter((item) => {
        return item.file_name.toLowerCase().includes(searchValue.toLowerCase());
      });
    }

    setFilteredHistory(filteredData);
  }, [selectedTab, user_history, selectedDateFilter, values, searchValue]);

  const handleClearFilter = () => {
    setSelectedTab(0); // Reset to default tab
    setSelectedDateFilter(0); // Reset to default date filter
    setValues({ from: "07/11/2024", to: "07/15/2024" }); // Reset date range
    setSearchValue(""); // Clear the search input
  };
  const handleDateInputChange = (newValues) => {
    setValues(newValues);
    setSelectedDateFilter(3); // Set to "Selected Range"
  };

    return (
        <div class="flex  space-between side-nav-box2" style={{ height: '95vh' }}>
            <div class="flex items-center col">
                <Link style={{ textDecoration: 'none', display: 'flex', lineHeight: '84%' }} to={`/${basePath}`}>
                    {/* <Button>Return</Button> */}
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                </Link>
                <div class="flex col" style={{ gap: '30px', position: 'relative', left: '3px', top: '28px' }}>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>Date Filter Options</div>
                        <div className="history-tabs" style={{ width: '249px' }}>
                            <Tabs grow={false} title="Size (Default) - Column Display" onTabChange={setSelectedDateFilter}>
                                <Tabs.Tab label="Today" value="0" />
                                <Tabs.Tab label="Last Week" value="1" />
                                <Tabs.Tab label="One  Month" value="2" />
                            </Tabs>
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>
                            Select Date Range<span>(mm/dd/ccyy)</span>
                        </div>
                        <div className="history-page-date-container" style={{ position: 'relative', top: '-9px', left: '-2px' }}>
                            <DateInputRange
                                subText=""
                                startDateLabel="Start Date"
                                endDateLabel="End Date"
                                width="150px"
                                label="DateInputRange Sandbox"
                                values={values}
                                onChange={handleDateInputChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                {isLoading ? (
                    <div>
                        Loading... <LoadingSpinner isLoading={isLoading} ariaLoadingLabel="Importing data" />
                    </div>
                ) : (
                    <div class="side-nav-bar-margin " style={{ height: '60vh', marginBottom: '20px' }}>
                        <div
                            style={{
                                textAlign: 'left',
                                fontSize: '30px',
                                fontWeight: '600',
                                marginBottom: '30px',
                                color: 'rgb(0 38 119)',
                            }}
                        >
                            History
                        </div>
                        <div
                            className="history-tabs"
                            style={{
                                minWidth: filteredHistory?.length === 0 ? '800px' : '95%',marginTop:"50px"
                            }}
                        >
                            <Tabs title="Tabs Sandbox" onTabChange={setSelectedTab}>
                                <Tabs.Tab label="All Files" value="0" />
                                <Tabs.Tab label="Completed" value="1" />
                                <br></br>
                                <Tabs.Tab label="Errors" value="2" />
                            </Tabs>
                        </div>
                        <div style={{ margin: '10px' }}>{filteredHistory?.length === 0 && <div>No data found</div>}</div>
                        {filteredHistory?.length > 0 && (
                            // <div className="history-content">
                            <Datatable historyData={filteredHistory}></Datatable>
                            // </div>
                        )}
                        {/* <div className="history-content">
              {filteredHistory.map((item, index) => (
                <HistoryItem key={index} item={item} />
              ))}
            </div> */}
          </div>
        )}
      </div>
      <div class="flex col">
        <div style={{visibility:"hidden" , width:"170px"}}>sdf</div>
      </div>
    </div>
  );
};

// Helper component for each history item
const HistoryItem = ({ item }) => {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const handleDownloadClick = () => {
    if (item.status === "Completed") {
      setShowDownloadPopup(!showDownloadPopup);
    } else {
      prompt(
        "File is not yet converted. Do you want to download the original file?",
        item.originalFileUrl
      );
    }
  };
  return (
    <Card key={item._id} className="history-card">
      <Card.Section className="history-card-section">
        <div className="flex space-between history-card-content">
          <div class="flex " style={{ gap: "25px" }}>
            <IconMaterial icon="article" className='card-file-icon' color="#002677" size="50" variant="outlined" />{" "}
            <div>
              <div>{item.file_name}</div>
              <div>{new Date(item.timestamp).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })}</div>
            </div>
          </div>
          <div className="flex  align-center" style={{ gap: "25px" }}>
            <div>
              {/* Conditional rendering of Badge */}
              {item.status === "Completed" ? (
                <Badge variant="success">{item.status}</Badge>
              ) : (
                <Badge variant="error">Errored Out </Badge>
              )}
            </div>
            <a href="javascript:void(0)" onClick={handleDownloadClick}>
              {item.status === "Completed" ? (
                <IconMaterial icon="file_download" />
              ) : (
                <IconMaterial icon="autorenew" />
              )}
            </a>
          </div>
        </div>
      </Card.Section>

      {showDownloadPopup && (
        <div
          style={{
            width: "108px",
            marginLeft: "79%",
            marginTop: "-15px",
            marginBottom:" 10px",
            fontSize: "14px",
        }
          }
        >
          <div className="download-popup">
            <button style={{padding:'4px'}}
              onClick={() => {
                window.location.href = item.originalFileUrl;
              }}
            >
              Original File
            </button>
            <button style={{padding:'4px'}}
              onClick={() => {
                window.location.href = item.formattedFileUrl;
              }}
            >
              Converted File
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};