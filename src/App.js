import React, { useState, useEffect } from 'react';
import { db, doc, updateDoc, getDoc, collection, getDocs, addDoc,setDoc } from './firebase';
import { DateTime } from 'luxon';
import './App.css';

function App() {
  const [statusCode, setStatusCode] = useState(null);
  const [error, setError] = useState(null);

  const writeLog = (message) => {
    console.log(`${DateTime.now().toISO()}: ${message}`);
  };

  const sendNotificationAndUpdateDocuments = async (alertTableId, alertStatusID) => {
    try {
      await updateDoc(doc(db, 'AlertTable', alertTableId), {
        AlertedTimestamp: new Date(),
      });

      await updateDoc(doc(db, 'AlertStatusTable', alertStatusID), {
        Status: 'Alerted',
      });
      await addDoc(collection(db, 'CronJobLogs'), {
        CronJobLogs: 'Success',
        TimeOfCronLog: DateTime.now().toISO(),
      });

      writeLog(`Notification sent and documents updated for AlertTable ID: ${alertTableId} and AlertStatus ID: ${alertStatusID}`);
    } catch (error) {
      await addDoc(collection(db, 'CronJobLogs'), {
        CronJobLogs: 'Failed',
        TimeOfCronLog: DateTime.now().toISO(),
        Error: error.message,
      });
      writeLog(`Error updating documents ${alertTableId} and ${alertStatusID}: ${error.message}`);
      throw error;
    }
  };

  const processDocuments = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'AlertTable'));
      const currentTime = DateTime.now();

      for (const i of snapshot.docs) {
        const docData = i.data();
        const timestamp = docData.ReturnTimestamp?.toDate();
        const returnDate = docData.ReturnDate?.toDate();

        if (timestamp) {
          const diffInMinutes = currentTime.diff(DateTime.fromJSDate(timestamp), 'minutes').minutes;

          if (diffInMinutes > 60) {
            writeLog(`Document ID ${i.id} is late by ${diffInMinutes} minutes.`);
            const alertStatusID = docData.AlertStatusID;

            if (alertStatusID) {
              const relatedDoc = await getDoc(doc(db, 'AlertStatusTable', alertStatusID));

              if (relatedDoc.exists()) {
                const relatedData = relatedDoc.data();

                if (relatedData.Status === 'Pending') {
                  await sendNotificationAndUpdateDocuments(i.id, relatedDoc.id);
                }
              } else {
                writeLog(`Related document with ID ${alertStatusID} does not exist.`);
              }
            } else {
              writeLog('No alertStatusID provided.');
            }
          }
        }
      }

      return 'OK';
    } catch (error) {
      await addDoc(collection(db, 'CronJobLogs'), {
        CronJobLogs: 'Failed',
        TimeOfCronLog: DateTime.now().toISO(),
        Error: error.message,
      });
      writeLog(`Error processing documents: ${error.message}`);
      return 'Error';
    }
  };

  useEffect(() => {
    const runProcessDocuments = async () => {
      try {
        const result = await processDocuments();
        writeLog(`Process Documents Result: ${result}`);
        setStatusCode(result === 'OK' ? 200 : 500);
      } catch (error) {
        setError('Error processing documents');
        setStatusCode(500);
      }
    };

    runProcessDocuments();
  }, []); // Empty dependency array ensures this runs only once, when the component mounts

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cron Job Integration</h1>
        {statusCode !== null && <p>Status Code: {statusCode}</p>}
        {error && <p>{error}</p>}
      </header>
    </div>
  );
}

export default App;
