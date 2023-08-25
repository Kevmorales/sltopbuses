import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function App() {
  // De tio översta busslinjerna.
  const [topBusLines, setTopBusLines] = useState([]);

  // Den busslinje användaren har valt från top 10 listan.
  const [selectedBusLine, setSelectedBusLine] = useState(null);

  // Hållplatsnamnen för den valda busslinjen.
  const [stopNames, setStopNames] = useState([]);

  // modalen ska visas eller ej.
  const [isModalVisible, setModalVisible] = useState(false);

  // Dela upp de översta busslinjerna i två listor: podium och övriga.
  const podiumBusLines = topBusLines.slice(0, 3);
  const otherBusLines = topBusLines.slice(3);

  const [isLoading, setIsLoading] = useState(false);

  // hämta top tio busslinjerna.
  const fetchTopBusLines = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://sl-top-bus-5ae71ac43dba.herokuapp.com/top-bus-lines"
      );
      if (Array.isArray(response.data)) {
        setTopBusLines(response.data);
      } else {
        console.error(
          "Oväntat format mottaget från top bus lines API:",
          response.data
        );
      }
    } catch (error) {
      console.error("Fel vid hämtning av top bus linjer:", error);
    }
    setIsLoading(false);
  }, []);

  // hämtar hållplatsnamn för en specifik busslinje.
  const fetchStopsForBusLine = useCallback(async (lineNumber, direction) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://sl-top-bus-5ae71ac43dba.herokuapp.com/${lineNumber}/${direction}`
      );
      if (Array.isArray(response.data)) {
        setStopNames(response.data);
      } else {
        console.error(
          "Oväntat format mottaget från bus line stops API:",
          response.data
        );
      }
    } catch (error) {
      console.error("Fel vid hämtning av hållplatser för busslinje:", error);
    }
    setIsLoading(false);
  }, []);

  function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          <span className="modal-close" onClick={onClose}>
            &times;
          </span>
        </div>
      </div>
    );
  }

  const handleBusLineClick = (line) => {
    setSelectedBusLine(line); // Sätt den valda busslinjen.
    fetchStopsForBusLine(line[0], "1"); //  stopp för busslinjen.
    setModalVisible(true);
  };

  // kör vid start
  useEffect(() => {
    fetchTopBusLines();
  }, [fetchTopBusLines]);

  return (
    <div className="scoreboard">
      {isLoading && (
        <div className="spinner">
          <svg viewBox="0 0 50 50" className="spinner-svg">
            <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
          </svg>
        </div>
      )}
      <div className="scoreboard__podiums">
        {podiumBusLines.map((line, index) => (
          <div
            className="scoreboard__podium is-visible"
            key={line[0]}
            onClick={() => handleBusLineClick(line)}
          >
            <div
              className={`scoreboard__podium-base scoreboard__podium-base--${
                ["first", "second", "third"][index]
              }`}
              data-height={`${300 - index * 50}px`}
              style={{ height: `${300 - index * 70}px`, opacity: 1 }}
            >
              <div className="scoreboard__podium-rank">{index + 1}</div>
            </div>
            <div className="scoreboard__podium-number">
              Buss {line[0].split("-")[0]}{" "}
              <small>
                <span>{line[1]} stopp</span>
              </small>
            </div>
          </div>
        ))}
      </div>

      {otherBusLines.map((line, index) => (
        <div
          className="status"
          key={line[0]}
          onClick={() => handleBusLineClick(line)}
        >
          <div className="status-content">
            <div className="left-side">
              {index + 4}
              <img
                src={`/icons/bus.svg`}
                alt="bus"
                width="24px"
                height="24px"
              />
              <span>Buss {line[0].split("-")[0]}</span>
            </div>

            <div className="right-side">
              <span>{line[1]} stopp</span>
            </div>
          </div>
        </div>
      ))}

      <Modal isOpen={isModalVisible} onClose={() => setModalVisible(false)}>
        <h2>
          Stopp för Buss {" "}
          {selectedBusLine && selectedBusLine[0].split("-")[0]}
        </h2>
        <ul>
          {stopNames.map((stop, index) => (
            <li key={index}>{stop}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export default App;
