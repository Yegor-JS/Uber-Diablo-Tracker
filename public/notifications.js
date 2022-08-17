oldData = [];
newData = [];

const notifiyAboutChanges = async () => {

  const data = await getResults();

  if (!oldData[0]) {
      j = 0;
    data.forEach((element) => {
      oldData.push(element);
      j++;
    });
  } else {
        j = 0;
      data.forEach((element) => {
        newData.push(element);
        j++;
      });

      const changedData = newData.filter((element, index) => 
        element.progress !== oldData[index].progress
      );

      if (changedData.length > 0) {

          const isLadder = ['Ladder', 'Non Ladder']
          const isHardcore = ['Hardcore', 'Softcore']

            changedDataToDisplay = '';
          
          changedData.forEach((element) => {
            changedDataToDisplay =
            changedDataToDisplay +
            isLadder[element.ladder - 1] + ', ' +
            isHardcore[element.hc - 1] + ', ' +
            possibleRegions[element.region - 1] + ': ' +
            element.progress + '/6; ';
          });

          changedDataToDisplay = changedDataToDisplay.substring(0, changedDataToDisplay.length-2) + ".";
          
          let isPlural;

          if (changedData.length === 1) {
            isPlural = "There's a change:";
            notification = new Notification(`${isPlural} ${changedDataToDisplay}`);
          } else {
            isPlural = "There are multiple changes!";
            notification = new Notification(isPlural);

          };

          console.log(Date()+':');
          console.log(isPlural, changedDataToDisplay);
          
          oldData = JSON.parse(JSON.stringify(newData));
          newData = [];
        } else {
            newData = [];
      }
    }

  setTimeout(() => {
    notifiyAboutChanges();
  }, UPDATE_TIMEOUT);
};

const requestNotificationPermission = () => {
    notificationTurnedOn = false;

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    notificationTurnedOn = true;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        notificationTurnedOn = true;
      }
    });
  }

  if (notificationTurnedOn) {
    notifiyAboutChanges();
  }
};

requestNotificationPermission();