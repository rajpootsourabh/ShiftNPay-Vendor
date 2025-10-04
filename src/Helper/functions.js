import moment from "moment";

export const formatTime = (seconds) => {
  // Ensure `seconds` is a valid number
  console.log('elapsedTime : ', seconds)
  // if (typeof seconds !== undefined || isNaN(seconds) || seconds < 0) {
  //     return "00:00:00";
  // }

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  // Format as HH:mm:ss
  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    secs.toString().padStart(2, "0"),
  ].join(":");

  return formattedTime;
};

export const formatDateTime = (dateTime) => {

  const date = new Date(dateTime);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");
  return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

export const decodeBase64Url = (base64Url) => {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

export const convertSecondsToHHMMSS = (sec) => {
  if (!sec) {
    return `00:00:00`;
  }
  let totalSeconds = Math.round(sec);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 3600) % 60;

  // Format hours, minutes, and seconds to be two digits
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
export const processWeeklyData = (response) => {
  if (!response) return [];

  const MAX_HOURS = 40;
  const SECONDS_IN_AN_HOUR = 3600;
  const SECONDS_IN_A_MINUTE = 60;

  const formatTime = (hours, minutes, seconds) => {
    let result = "";
    if (hours > 0) result += `${hours} hr `;
    if (minutes > 0) result += `${minutes} min `;
    if (seconds > 0) result += `${seconds} sec`;
    return result.trim() || "N/A";  // If empty, return "N/A"
  };

  const processedData = response.map(job => {
    console.log('job : ', job.totalDuration);

    const totalSeconds = Math.max((job.totalDuration ?? 0) - (job.totalBreakDuration ?? 0), 0);
    const breakSeconds = job.totalBreakDuration ?? 0;

    // Convert total time
    const totalHours = Math.floor(totalSeconds / SECONDS_IN_AN_HOUR);
    const totalMinutes = Math.floor((totalSeconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE);
    const totalSecs = Math.floor(totalSeconds % SECONDS_IN_A_MINUTE);

    // Convert break time
    const breakHours = Math.floor(breakSeconds / SECONDS_IN_AN_HOUR);
    const breakMinutes = Math.floor((breakSeconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE);
    const breakSecs = Math.floor(breakSeconds % SECONDS_IN_A_MINUTE);

    // Productive time
    const productiveSeconds = job.totalDuration ?? 0;
    const productiveHours = Math.floor(productiveSeconds / SECONDS_IN_AN_HOUR);
    const productiveMinutes = Math.floor((productiveSeconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE);
    const productiveSecs = Math.floor(productiveSeconds % SECONDS_IN_A_MINUTE);

    // Calculate overtime
    const overtimeSeconds = totalSeconds > MAX_HOURS * SECONDS_IN_AN_HOUR ? totalSeconds - MAX_HOURS * SECONDS_IN_AN_HOUR : 0;
    const overtimeHours = Math.floor(overtimeSeconds / SECONDS_IN_AN_HOUR);
    const overtimeMinutes = Math.floor((overtimeSeconds % SECONDS_IN_AN_HOUR) / SECONDS_IN_A_MINUTE);
    const overtimeSecs = Math.floor(overtimeSeconds % SECONDS_IN_A_MINUTE);

    return {
      empId: 'EMP' + job.employeeId,
      ssnNo: job.ssnNo,
      jobName: job.jobName,
      date: job.date,
      employeeName: `${job.firstName} ${job.lastName}`,
      overtimeHours: formatTime(overtimeHours, overtimeMinutes, overtimeSecs),
      breakTime: formatTime(breakHours, breakMinutes, breakSecs),
      totalHours: formatTime(productiveHours, productiveMinutes, productiveSecs),
      productiveHours: formatTime(totalHours, totalMinutes, totalSecs),
    };
  });

  return processedData;
};


export const processOverTimeData = (trackingData) => {
  if (!trackingData) return [];
  console.log('trackingData : ', trackingData)

  const processedData = trackingData.map(job => {
    return {
      name: job?.jobDetails?.name,
      sessionDate: formatToSimpleDate(job?.sessionDate),
      startTime: formatDateTime(job?.startTime),
      stoppedTime: formatDateTime(job?.stoppedTime),
      BreakTime: formatTime(job?.totalBreakTime),
      TotalTime: formatTime(job?.elapsedTime),
    };
  });

  return processedData;
};

export const timeAgo = (date) => {
  return moment(date).fromNow();
};

export const timeDifferenceInHours = (date, end = null) => {
  const now = end ? new Date(end) : new Date();
  const diff = now - new Date(date); // Difference in milliseconds

  const totalSeconds = Math.floor(diff / 1000); // Total seconds
  const totalMinutes = Math.floor(totalSeconds / 60); // Total minutes
  const hours = Math.floor(totalMinutes / 60); // Total hours

  const remainingMinutes = totalMinutes % 60; // Minutes beyond the hour
  const remainingSeconds = totalSeconds % 60; // Seconds beyond the minute

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};



export const formatFileSize = (sizeInBytes) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} bytes`;
  } else if (sizeInBytes < 1048576) { // 1024 * 1024
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1073741824) { // 1024 * 1024 * 1024
    return `${(sizeInBytes / 1048576).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / 1073741824).toFixed(2)} GB`;
  }
};


export const calculateTotalAmount = ({ rate, overtimeRate, timeInSeconds }) => {
  const MAX_HOURS = 40;
  const OVERTIME_MULTIPLIER = overtimeRate || 0;
  const SECONDS_IN_AN_HOUR = 3600;
  // Total seconds from the response
  const totalSeconds = timeInSeconds;
  // Convert total seconds to hours
  const totalHours = totalSeconds / SECONDS_IN_AN_HOUR;
  // Calculate overtime hours
  const overtimeHours = totalHours > MAX_HOURS ? totalHours - MAX_HOURS : 0;
  const normalHours = totalHours > MAX_HOURS ? MAX_HOURS : totalHours;

  // Calculate payments
  const normalPay = normalHours * rate;
  const overtimePay = overtimeHours * rate * OVERTIME_MULTIPLIER;
  const totalPay = normalPay + overtimePay;
  return '$' + totalPay.toFixed(2);
}

export const calculateTotalWorkingTime = (data) => {
  const timeToHoursAndMinutes = (start, end) => {
    // Convert clockIn and clockOut times (as strings) to total time in decimal hours
    const startDate = new Date(`2025-02-10T${start}`); // Assume the date is same for all rows, only time differs
    const endDate = new Date(`2025-02-10T${end}`);

    const diffInMilliseconds = endDate - startDate; // Difference in milliseconds
    const diffInSeconds = diffInMilliseconds / 1000; // Convert to seconds

    // Convert to hours (decimal format)
    const hours = diffInSeconds / 3600;
    return hours;
  };

  const jobUserTotals = {};

  // Iterate through the data
  for (let i = 1; i < data.length; i++) { // Skip header row
    const row = data[i];
    const name = row[0]; // User's name
    const jobName = row[1]; // Job's name
    const clockIn = row[4];
    const clockOut = row[5];
    const workingHours = row[7];

    // Skip rows where clockIn or clockOut is missing or invalid
    if (!clockIn || !clockOut) continue;

    // Calculate working time only if both clockIn and clockOut are available
    const workingTime = timeToHoursAndMinutes(clockIn, clockOut);

    if (!jobUserTotals[jobName]) {
      jobUserTotals[jobName] = {}; // Initialize job grouping
    }
    if (!jobUserTotals[jobName][name]) {
      jobUserTotals[jobName][name] = 0; // Initialize user total within job group
    }
    jobUserTotals[jobName][name] += workingTime;
  }

  // Convert results to an array of objects for easier readability
  const result = [];
  for (const jobName in jobUserTotals) {
    for (const name in jobUserTotals[jobName]) {
      result.push({
        jobName,
        name,
        amount: 0,
        totalWorkingTime: jobUserTotals[jobName][name].toFixed(2), // Round to 2 decimal places
      });
    }
  }

  return result;
};
export const getUserName = (user) => {
  const nameFields = [
    user?.newWayName,
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName,
    user?.name
  ];

  for (const field of nameFields) {
    if (field && field.trim().length > 1) {
      return field.trim();
    }
  }

  return 'Name Not Updated';
};


export const formatToSimpleDate = (date) => {
  if (!date) return ""; // Handle invalid input

  const utcDate = new Date(date);

  // Extract year, month, and day
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(utcDate.getDate()).padStart(2, "0");

  console.log(utcDate.toLocaleString()); // Convert to local time (browser time zone)

  return `${year}-${month}-${day}`; // Format YYYY-MM-DD
};


export const convertToUTC = (dateString, timeString) => {
  // 1. Convert date string to a Date object in local timezone
  let localDate = new Date(dateString);

  // 2. Extract hours and minutes from the timeString (e.g., "02:50")
  let [hours, minutes] = timeString.split(":").map(Number);

  // 3. Set the local date's hours and minutes
  localDate.setHours(hours, minutes, 0, 0);

  // 4. Convert to UTC string
  let utcDate = localDate.toISOString();

  return utcDate;
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { // Adjust the locale and options as needed
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};


