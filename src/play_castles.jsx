import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './MenuStyles.css';
import './play_castles.css';
import castlesRoomSupply from './castle_rooms.json';




class Player {
  constructor(name, color, totalScore, startingRoom) { //startingRoom
      this.name = name;
      this.color = color;
      this.roomsArray = [startingRoom];  // Array to store rooms for each round
      this.scoresArray = [totalScore]; // Starting room har ikke noen poeng
      this.selectedRoomCategory = "Category"; // Skal disse henvise til et Room?
      this.availableRoomSizes = ["Size"];
      this.selectedRoomSize = 0; 
      this.availableBonuses = ["Bonus"];
      this.selectedRoomBonus = "Bonus";
      this.selectedRoom = null; 
      this.roomAdded = false; // Disabler "Add Room" knappen
      this.totalScore = totalScore;  
  }
}

function PlayCastles() {

  const castleRooms = useRef(castlesRoomSupply);
  // Direct Mutations: Be mindful when directly mutating objects or arrays referenced by refs. While useRef doesn’t cause re-renders, direct mutations bypass React's state management and can lead to harder-to-track bugs.


  const categories = ["Category", ...new Set(castleRooms.current.map(room => room.category).sort())];
  // legger foreløpig ikke opp til at denne skal kunne endres (det blir tomt for rom i en kategori etter hvert, men det er ikke et alvorlig problem, bare en lite UX-greie)

  const imageSize = {
    75: 1*10 + 25,
    100: 3*10 + 25,
    125: 5*10 + 25,
    149: 1*10 + 25,
    150: 3*10 + 25,
    200: 5*10 + 25,
    250: 5*10 + 25,
    300: 5*10 + 25,
    350: 10*10 + 25,
    400: 6*10 + 25,
    450: 6*10 + 25,
    500: 8*10 + 25,
    600: 10*10 + 25
  };

  const [players, setPlayers] = useState([
    new Player("Alice", "Blue", 0, castleRooms.current.find(room => room.roomName === "Blue")),
    new Player("Bob", "Red", 1, castleRooms.current.find(room => room.roomName === "Red")),
    new Player("Charlie", "Orange", 2, castleRooms.current.find(room => room.roomName === "Orange")),
  ]); // Erstattes av Setup

  const [activePlayer, setActivePlayer] = useState(players[0]); // starte med 'null'?

  const [activeRoom, setActiveRoom] = useState(null);


  // Ser etter activeRoom når noe endres
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect( () => {
    if (selectedCorridorBonus) { // blir selectedCorridorBonus resatt for downstairsBonus?
      // Funker ikke for downstairsCorridorBonus pga for kort action chain; blir ikke opdatert i tide
      setActiveRoom (castleRooms.current.find(room => room.roomName === selectedCorridorBonus));
      // console.log("selectedCorridorBonus is: ", selectedCorridorBonus);
      // console.log("Setting activeRoom = selectedCorridorBonus. Resetting selectedCorridorBonus: ", castleRooms.current.find(room => room.roomName === selectedCorridorBonus));
      // setSelectedCorridorBonus(""); // for tidlig å resette her? Vente til addRoom?
    } else {
      setActiveRoom(castleRooms.current.find(room => 
        room.category === activePlayer.selectedRoomCategory 
        && room.size === activePlayer.selectedRoomSize 
        && (room.bonus === activePlayer.selectedRoomBonus || room.bonus === "")))
      // console.log("activeRoom search:", castleRooms.current.find(room => 
      //   room.category === activePlayer.selectedRoomCategory 
      //   && room.size === activePlayer.selectedRoomSize 
      //   && room.bonus === activePlayer.selectedRoomBonus)); // console.log
    }
    if (downstairsCorridorBonusChosen){ // Denne tror jeg er redundant nå 
      console.log("Going to addRoom from useEffect");
      addRoom();
    }
  }, [activePlayer]); 
  // denne kan endres til å lytte til  selectedCorridorBonus, downstairsCorridorBonusChosen 
  // så kan addRoom kalles fra handleCorridorBonus() / handleDownstairsCorridorBonus
  // og addRoom kan forenkles (kanskje?)

  const updateTotalScore = (addScore) => { // er addScore nødvendig her?
    const sum = players[clickedPlayerIndex].scoresArray.reduce((acc, score) => acc + score, 0);
    setPlayers(prevPlayers => prevPlayers.map(player => 
      player.name === players[clickedPlayerIndex].name ? 
      {
        ...player,
        totalScore: sum + addScore
      } : player 
    ));
  }; // får ikke med siste rommet. Tror det er løst nå
  // Sjekk at endringer i bonuser (activity) kommer med.

  const getPlayerBackgroundColor = (color) => {
    if (color === 'Red' && activePlayer.color === 'Red') {
      return 'rgba(255, 230, 230, 0.5)'; 
    } else if (color === 'Blue' && activePlayer.color === 'Blue') {
      return 'rgba(204, 245, 255, 0.5)'; 
    } else if (color === 'Orange' && activePlayer.color === 'Orange') {
      return 'rgba(255, 250, 205, 0.5)'; 
    } else if (color === 'Green' && activePlayer.color === 'Green') {
      return 'rgba(222, 252, 226, 0.5)'; // Litt kraftig, prøver mer gjennomsiktighet
    } else {
      return 'rgba(240, 240, 245, 0.5)'; // Even lighter gray with transparency for non-active players
    };
  }; // getPlayerBackgroundColor
  

  const handleCategoryChange = (newCategory) => { // kan også skrives som ternary
    let sizes = [];
    const roomsOfCurrentCategory = castleRooms.current.filter(room => room.category === newCategory);
    const bonuses = castleRooms.current.filter(room => room.category === newCategory && room.size === activePlayer.selectedRoomSize && room.bonus).map(room => room.bonus);
    for (let i = 0; i < roomsOfCurrentCategory.length; i++) {
      if (!sizes.includes(roomsOfCurrentCategory[i].size)) {
        sizes.push(roomsOfCurrentCategory[i].size);
      } else {
        console.log("No roomSize added")
    };
      //console.log("FOR-loop", i);
    };
    setPlayers(prevPlayers => prevPlayers.map(player => {
      if (player.name === activePlayer.name) {
        return {
          ...player,
          selectedRoomCategory: newCategory,
          availableRoomSizes: ["Size", ...sizes],
          availableBonuses: ["Bonus", ...bonuses]
        };
      }
      return player;
    }));

    setActivePlayer(players.map( player => { // Kan man bruke find-updatedPlayers? Usikker på om det skaper sync-issues
      // Finner/setter activePlayer, og oppdaterer samtidig med samme informasjon som oppdateres i 'players'.
      // Tror jeg kan oppdatere activePlayer uten å iterere over 'players' | Er clickedPlayerIndex tilgjengelig her?
      if (player.name === activePlayer.name) {
        // console.log(" setActivePlayer in handleCategoryChange -> ", player.name, player.selectedRoomCategory, newCategory, player.selectedRoomSize, player.selectedRoomBonus)
        return { 
          ...player, 
          selectedRoomCategory: newCategory,
          availableRoomSizes: ["Size", ...sizes],
          availableBonuses: ["Bonus", ...bonuses]
        };
      };
      return player; // spillere som ikke matcher playerName
    }).find(player => player.name === activePlayer.name)); // Er denne altfor omfattende? Kan jeg bare oppdatere activePlayer uten å iterere over players?
  }; // handleCategoryChange


  // Finding available bonuses when roomSize changes
  const handleRoomSizeChange = (nySize) => { 
    const newSize = Number(nySize); // Kan jeg forenkle dette ? -> Av en eller anne grunn finner den ikke rommet når jeg forenkler. Revisit.
    const bonuses = castleRooms.current.filter(room => 
      room.category === players[clickedPlayerIndex].selectedRoomCategory 
      && room.size === Number(newSize) 
      && room.bonus).map(room => room.bonus); 
    setPlayers(prevPlayers => prevPlayers.map(player => {
      if (player.name === activePlayer.name) {
        return {
          ...player,
          selectedRoomSize: newSize,
          availableBonuses: ["Bonus", ...bonuses]
        };
      };
      return player;
    })); 
    setActivePlayer(players.map(player => { // Er denne altfor omfattende? Kan jeg bare oppdatere activePlayer uten å iterere over players?
      // Tror jeg kan forenkle. Se over.
      if (player.name === activePlayer.name) {
        return { ...player, 
          selectedRoomSize: newSize,
          availableBonuses: ["Bonus", ...bonuses],
        };
      };
      return player;
    }).find(player => player.name === activePlayer.name)); 
  }; // handleRoomSizeChange
  
  //
  const handleRoomBonusChange = (newBonus) => {
    setPlayers(prevPlayers => prevPlayers.map(player =>
      player.name === activePlayer.name ? { 
        ...player, 
        selectedRoomBonus: newBonus
      } : player // Kan jeg skrive denne på en annen måte? Hva er relasjone til syntakset brukt i 'filter'?
    ));
    setActivePlayer(players.map(player => {
      if(player.name === activePlayer.name) { // Kan jeg skrive denne som ternary?
        return { ...player, selectedRoomBonus: newBonus};
      }
      return player;
    }).find(player => player.name === activePlayer.name)); // Trenger jeg iterere over players? 
  }; // handleRoomBonusChange -> set selectedRoom 

  // Legger et rom til roomsArray og oppdaterer scoresArray
  const addRoom = () => { 
    // console.log("-------------> Adding room");
    // try {
    //   console.log("clickedRoom.completionBonus", players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus);
    // } catch (error) {
    //   console.log("Couldn't find room.completionBonus");
    // };
    let downstairsBonus = 0;
    try {
      console.log("--> activeRoom = ", activeRoom.roomName);
    }
    catch (error) {
      console.log("--> activeRoom not found");
    }
    // kan jeg bruke selectedCorrisdorBonus her?
    if(activeRoom || selectedCorridorBonus){ // ER SELECTEDcORRIDORbONUS RELEVANT HER? ->Neppe, fjernet
      console.log("selectedCorridorBonus antas å være 'false' her", selectedCorridorBonus ? selectedCorridorBonus : "false"); // selectedCorridorBonus er 'true' dersom den kommer via downstairsCorridorBonus(Tror jeg)
      // CORRIDOR TEST (hvorfor !selectedCorridorBonus? -> Hvis selectedCorridorBonus så kjøres den etterpå, og activeRoom skal ikke addes.)
      // er selectedCorridorBonus aktiv? eller er del alltid 'false' her?
      // Gjør eventuelt koden for corridorBonus lengst ned i funksjonen/metoden redundant.

      // Calculating bonus if added room is "Downstairs"
      if(activeRoom){console.log("activeRoom in addRoom() (ellers selecetedCorridorBonus): ", activeRoom.roomName);}
      if(!selectedCorridorBonus && activeRoom.category === "Downstairs") {
        for (let i = 0; i < activePlayer.roomsArray.length; i++) { //regner ikke med rommet som legges til (fikset?)
          if (activePlayer.roomsArray[i].category === activeRoom.bonus) {
            downstairsBonus += activeRoom.bonusValue;
          };
        };
        if (activeRoom.bonus === "Downstairs") { 
          downstairsBonus += activeRoom.bonusValue;
        };
    };
      
      
      let moreDownstairsBonus = 0; // til å beregene updateScore
      // When added room is "Stairs" or "Hallway" form downstairsBonus  (???)
      // Prøver å erstatte activeRoom med enten selectedCorridorbonus eller activeRoom; antar at bare én av dem er aktive av gangen.
      const tempRoom = selectedCorridorBonus ? castleRooms.current.find(room => room.roomName === selectedCorridorBonus) : activeRoom;
      console.log("tempRoom: ", tempRoom.roomName, tempRoom.value);
      const downstairsRoomsWithBonus = activePlayer.roomsArray 
      .filter(room => room.category === "Downstairs" && room.bonus === tempRoom.category); // Plukker ut downstairs rooms med relevant bonus
      let updatedScoresArray = activePlayer.scoresArray; //Beware of sync issues
      for (let i = 0; i < downstairsRoomsWithBonus.length; i++) { // updating downstairs bonuses
        const downstairsIndex = activePlayer.roomsArray.indexOf(downstairsRoomsWithBonus[i]);
        updatedScoresArray.splice(downstairsIndex, 1, activePlayer.scoresArray[downstairsIndex] + activePlayer.roomsArray[downstairsIndex].bonusValue);
        moreDownstairsBonus += activePlayer.roomsArray[downstairsIndex].bonusValue; // hva gjør denne nå? -> Skal oppdatere totalScore
      };
      // Adding room 
      setPlayers(prevPlayers => prevPlayers.map(player => // Unngå crash når ikke alle variable er valgt
        player.name === activePlayer.name ? { 
          ...player,
          scoresArray: [ ...updatedScoresArray, tempRoom.value + downstairsBonus], 
          roomsArray: [...player.roomsArray, tempRoom],
          selectedRoomCategory: "Category", // Resetter dropdowns
          selectedRoomSize: "Size",
          selectedRoomBonus: "Bonus",
          roomAdded: selectedCorridorBonus ? player.roomAdded : true, // 'Add room' knappen disables etter bruk. Re-enables ved Food-bonus
          // roomAdded må ikke settes ved corridor/downstairsCorridor bonus. 
        } : player
      ));
      setActivePlayer(prevActivePlayer =>  // Unngå crash når ikke alle variable er valgt
      ({ 
        ...prevActivePlayer,
        scoresArray: [ ...prevActivePlayer.scoresArray, tempRoom.value + downstairsBonus],
        roomsArray: [...prevActivePlayer.roomsArray, tempRoom],
        selectedRoomCategory: "Category", // Resetter dropdowns
        selectedRoomSize: "Size",
        selectedRoomBonus: "Bonus",
        roomAdded: selectedCorridorBonus ? prevActivePlayer.roomAdded : true, // 'Add room' knappen disables etter bruk. Re-enables ved Food-bonus
      }));
      // Resetter variablene tilhørende downstairsCorridorBonus
      setSelectedCorridorBonus(""); // litt usikker på om denne er nødvendig, men tror det. (sync-issues?)
      setDownstairsCorridorBonusChosen(false);
    
      if (!selectedCorridorBonus && activeRoom.roomName !== "Hallway" && activeRoom.roomName !== "Stairs") { // Unntak for Hallways og stairways, som det finnes flere av.
        castleRooms.current.splice(castleRooms.current.indexOf(activeRoom), 1); //Fjerner activeRoom fra castleRooms (Trenger den en dobbelsjekk av at activeRoom finnes i castleRooms? Nei, tror ikke det.)
      };
      setToastMessage({message: "Click rooms that gain bonuses or penalties, or have exits closed", color: '#33bd4c'});
      // updateTotalScore skal endres til å bare summere scoresArray(ved Modal close). (Foreløpig kompenserer denne for sync-issues.)
      updateTotalScore(downstairsBonus + moreDownstairsBonus + tempRoom.value); // Downstairs bonus inneholder både verdiene til nyeste downstairs room, FLYTTET -> og oppdaterte verdier for tidligere downstairs rooms.
      displayToast();
    } else if (!activeRoom && !selectedCorridorBonus) {
      setToastMessage({message: "Please select an actual room", color: '#f0ad4e'});
      displayToast(); // Viser Toast-melding om at gyldig rom ikke er valgt. (Bør meldingen skrives i denne funksjonen?)
      // if(activeRoom && !selectedCorridorBonus)
    } else {
      console.log("ERROR IN addRoom!");
    }; 
    
    // setter focus på 'End turn' knappen når rom er lagt til (det er kanskje teit? Lett å glemme exits og bonuser?)
    endTurnFocus.current.focus();
  }; //addRoom


  const endTurn = () => { 
    // Bytter til neste activePlayer
    // setIsModalOpen(false); // Prøver å fikse 'undefined reading category' i Modal --> funka ikke
    setClickedRoom(null); // Prøver å fikse 'undefined reading category' i Modal --> FUNKER!!
    console.log("_________________________________________________________endTurn running");
    setPlayers(prevPlayers => prevPlayers.map(player => 
      player.name === activePlayer.name ? { 
      ...player, 
      roomAdded: false, 
    } : player))
    const currentIndex = players.findIndex(player => player.name === activePlayer.name); // potensielle sync-issues?
    const nextIndex = (currentIndex + 1) % players.length; 
    setActivePlayer(players[nextIndex]);
    setClickedPlayerIndex(nextIndex); // Tror disse to egentlig gjør samme jobb, og er redundante.
    setCorridorBonusConfirmationMessage(false); 
    setCorridorbonusUsed(false);
    setDownstairsCorridorBonusChosen(false);
    // console.log("activeplayer and clickedplayerIndex set. Index: ", nextIndex);
  }; //endTrun


  const [showToast, setShowToast] = useState(false);

  const [toastMessage, setToastMessage] = useState({message: "Hei", color: 'yellow'});

  const Toast = ({ message, show }) => {
    if (!show) return null;
  
    return (
      <div className="toast" style={{backgroundColor: toastMessage.color}}>
        {message}
      </div>
    );
  };
  
  const displayToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500); // Hide toast after 2.5 seconds
    // setTimeout(() => { //TOAST
    //   toastElement.classList.add('slide-out');
    // }, 3000); // Adjust the delay as needed (For fade-out effect)
  };
  
  const [clickedRoom, setClickedRoom] = useState(null); // Brukes den?
  const [clickedRoomIndex, setClickedRoomIndex] = useState(1);  // useState(null) hvorfor er den '1'? Hva med '0'?
  const [clickedPlayerIndex, setClickedPlayerIndex] = useState(1); // useState(null)


  const adjustOpenExits = (change) => {
    if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].openExits + change > 0) {
      setDisableModalOKbutton(false); // enabler ikke uten exit-change
    } // re-enabler OK når openExits > 0
    setPlayers(prevPlayers => prevPlayers.map((player, index) => 
      index === clickedPlayerIndex ? {
          ...player,
          roomsArray: player.roomsArray.map((room, rindex) => 
            rindex === clickedRoomIndex ? {
                ...room, 
                openExits: room.openExits + change
              } : room 
          )
        } : player 
    ));
  };
  
  // Gir bonus poeng for riktig adjacent room (Downstairs bør logges automatisk)
  const adjustRoomBonus = (change) => {// Husk alert for bonus(exit?) decrease
    const livingRoomCompleteDoubler = players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Living" 
                                      && players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus
                                      ? 2 : 1; // Hvis Living romm bonuser justeres etter at rommet er scoret. 
    setPlayers(prevPlayers => prevPlayers.map((player, index) => 
      index === clickedPlayerIndex ? {
        ...player,
        roomsArray: player.roomsArray.map((room, rindex) => // også scoresArray
          rindex === clickedRoomIndex ? {
            ...room,
            bonusesAchieved: room.bonusesAchieved + change
          } : room),
        scoresArray: player.scoresArray.map((score, sindex) => 
          sindex === clickedRoomIndex ?  score + change * livingRoomCompleteDoubler * players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusValue : score) 
      } : player
    ));
  };

  // Legger til 5p activity bonus når 'Confirm' klikkes
  const handleActivityBonus = (complete) => {
    setPlayers(prevPlayers => prevPlayers.map((player, index) => 
      index === clickedPlayerIndex ? {
        ...player,
        roomsArray: player.roomsArray.map((room, rindex) => 
          rindex === clickedRoomIndex ? {
            ...room,
            completionBonus: complete,
        } : room),
        scoresArray: player.scoresArray.map((score, sindex) => 
          sindex === clickedRoomIndex ? score + 5 * Number(complete) - 5 * !Number(complete) : score)
    } : player));
  };

  // Enabler 'addRoom' knappen (food bonus) når 'Confirm' klikkes
  const handleFoodBonus = (complete) => {
    setPlayers(prevPlayers => prevPlayers.map((player, index) => 
      index === clickedPlayerIndex ? {
        ...player,
        roomAdded: !complete, // Må ikke føkke opp før rom er lagt til --> Disable room buttons frem til rom er lagt til.
        roomsArray: player.roomsArray.map((room, rindex) => 
          rindex === clickedRoomIndex ? {
            ...room,
            completionBonus: complete,
        } : room),
    } : player));
  };

  // scores selected living room anew
  const handleLivingRoomBonus = (complete) => {
    setPlayers(prevPlayers => prevPlayers.map((player, index) =>
      index === clickedPlayerIndex ? {
        ...player,
        roomsArray: player.roomsArray.map((room, rindex) => 
          rindex === clickedRoomIndex ? {
            ...room,
            completionBonus: complete,
          } : room,
        ),
        scoresArray: player.scoresArray.map((score, sindex) => 
          sindex === clickedRoomIndex ? score + Number(complete) * player.roomsArray[clickedRoomIndex].value 
                                              + Number(complete) * player.roomsArray[clickedRoomIndex].bonusValue 
                                                                 * player.roomsArray[clickedRoomIndex].bonusesAchieved 
                                              - !Number(complete) * player.roomsArray[clickedRoomIndex].value 
                                              - !Number(complete) * player.roomsArray[clickedRoomIndex].bonusValue 
                                                                  * player.roomsArray[clickedRoomIndex].bonusesAchieved 
          : score
        ),
      } : player
    ));
  };


  // Legger til bonus korridor
  const handleCorridorRoomBonus = (inputCorridorBonus) => {//chosenCorridorBonus = inputCorridorBonus
    // console.log("handleCorridorRoomBonus running");
    if (["Hallway", "Stairs", "N/A"].includes(inputCorridorBonus) && !downstairsCorridorBonusChosen){
      setPlayers(prevPlayers => prevPlayers.map((player, index) => 
        index === clickedPlayerIndex ? {
          ...player,
          roomsArray: player.roomsArray.map((room, rindex) => 
            rindex === clickedRoomIndex ? {
              ...room,
              completionBonus: true, // Skal ikke settes før 'Lock'/'Yes!' ('Confirm' skal ikke hit)
              chosenCorridorBonus: inputCorridorBonus,
          } : room),
      } : player));
    setActivePlayer(prevPlayer => ({
      ...prevPlayer,
      roomsArray: players[clickedPlayerIndex].roomsArray.map((room, roomIndex) => 
        roomIndex === clickedRoomIndex ? {
          ...room,
          completionBonus: true,
          chosenCorridorBonus: inputCorridorBonus,
        } : room)
    }));
      //    addRoom(); // Legger til valgt korridor-rom bonus (kalles fra 'Lock' button, ikke herfra)
    } // if Hallway/stairs/NA
    else if (downstairsCorridorBonusChosen){ // Skal ikke være mulig å komme hit uten å velge "Hallway" eller "Stairs"
      // console.log("\t downstairsCorridorBonus: handleCorridorBonus");
      setPlayers(prevPlayers => prevPlayers.map((player, index) => 
        index === clickedPlayerIndex ? {
          ...player,
          roomsArray: player.roomsArray.map((room, rindex) => 
            rindex === clickedRoomIndex ? {
              ...room,
              // completionBonus: true, // redundant
              chosenDownstairsBonus: inputCorridorBonus,
          } : room),
      } : player));
    setActivePlayer(prevPlayer => ({
      ...prevPlayer,
      roomsArray: players[clickedPlayerIndex].roomsArray.map((room, roomIndex) => 
        roomIndex === clickedRoomIndex ? {
          ...room,
          // completionBonus: true, // redundant?
          chosenDownstairsBonus: inputCorridorBonus,
        } : room)
    }));
    // addRoom(); // Gir dette sync-issues? (kan også ligge i useEffect-activeRoom )
    } // corridor bonus from downstairs bonus
    else if (inputCorridorBonus === "Cancel"){ // 'No' button gjør corridorBonus available igjen == bad
      //Setter openExits = 1 og lukker Modalen 
      setPlayers(prevPlayers => prevPlayers.map((player, index) => 
      index === clickedPlayerIndex ? {
        ...player,
        roomsArray: player.roomsArray.map((room, rindex) => 
          rindex === clickedRoomIndex ? {
            ...room,
            openExits: 1,
            completionBonus: false, // kansellerer 'confirm'
            chosenCorridorBonus: "", // Viktig for 'Abort' button(?). Kontroller at denne ikke sletter en bonus som skal være låst.
        } : room),
      } : player));
      // setSelectedCorridorBonus(""); // lager problemer for downstairsCorridorBonus
      setIsModalOpen(false); 
      setDisableModalOKbutton(false); // skal funke
      setCorridorBonusConfirmationMessage(false); 
      // FIKSET? Konflikt mellom 'Abort' og 'No' -> if(.completionbonus?) ==> flyttes til respektiv knapp?
    }
  }; // handleCorridorRoomBOnus

  const [downstairsCorridorBonusChosen, setDownstairsCorridorBonusChosen] = useState(false);

  // Handles the bonuses for completed Downstairs rooms
  // setting completionBonus, chosenDownstairsBonus, scoresArray
  // Living room bonus gjelder bare for det respektive Downstairs rommet(?)
  //    -> Hva med bonuser som legges til senere? Dobles de også? *Antar de ikke dobles. 
  const handleDownstairsBonus = (chosenBonusFromButton) => { 
  setDisableModalOKbutton(false); // enabler knappen når downstairsBonus er satt.
  if (chosenBonusFromButton === "Corridor") {
    setDownstairsCorridorBonusChosen(true); // skifter path i activateRoomBonus
  }
    // Settes ved 'Lock bonus'
    setPlayers(prevPlayers => {
      const downstairsActivityBonus = chosenBonusFromButton === "Activity" ? 5 : 0;
      const downstairsLivingBonus = chosenBonusFromButton === "Living" 
        ? prevPlayers[clickedPlayerIndex].roomsArray.filter(
        room => room.category === prevPlayers[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonus).length // Re-scoreing downstairs bonus for all rooms
        * prevPlayers[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusValue 
        + players[clickedPlayerIndex].roomsArray[clickedRoomIndex].value : 0;
      // Scorer dette kjellerrommet om igjen med nåværende bonus. Påvirker ikke bonuser som legges til senere(Burde den? Hva sier reglene? Dersom den skal gjøre det, må det gjøres en bonus-sjekk for å sjekke om bonusen skal dobles).
      return prevPlayers.map((player, index) => 
        index === clickedPlayerIndex ? {
          ...player,
          roomsArray: player.roomsArray.map((room, rindex) => 
            rindex === clickedRoomIndex ? {
              ...room,
              completionBonus: true,
              chosenDownstairsBonus: chosenBonusFromButton, 
            } : room),
          scoresArray: player.scoresArray.map((score, sindex) => 
            sindex === clickedRoomIndex ? score + downstairsActivityBonus + downstairsLivingBonus : score),
        } : player)
        // activePlayer setter ikke her. Tror ikke det er nødvendig.
        //console.log("addedDownstairsBonusPoints: ", addedDownstairsBonusPoints);
      }); // kan jeg aktivere Modal-OK-button her?
      
  };

  const [selectedDownstairsBonus, setSelectedDownstairsBonus] = useState("N/A");

  const [selectedCorridorBonus, setSelectedCorridorBonus] = useState("");
  
  // Brukes til å velge mellom downstairs bonus display messages
  const [bonusActive, setBonusActive] = useState(false); 

  // Dialog for enten å velge bonus, eller informasjon om at ett rom til må lukkes.
  const handleDownstairsCompletionBonusText = () => { //Den kjøres 4 ganger. Hvorfor? Er det et problem? 
    // bonusActive avgjør om det skal aktiveres og velges en bonus (trenger den være en state-variable?)
    setBonusActive(players[clickedPlayerIndex].roomsArray.filter(room => room.category === "Downstairs" && room.completionBonus).length % 2 === 1);
    // console.log("handleDownstairsCompletionBonusText, bonusActive: ", players[clickedPlayerIndex].roomsArray.filter(room => room.category === "Downstairs" && room.completionBonus).length % 2 === 1);
    if (bonusActive){
      return (
        <div className="radio-buttons">
          Choose your bonus:<br />
          <span className='radio-alignment'><span><input type="radio" id="Food" value="Food" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Food"} /><label htmlFor="Food">Extra turn </label></span><span className="radio-category-text">(food)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Activity" value="Activity" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Activity"} /><label htmlFor="Activity">5 extra points </label></span><span className="radio-category-text">(activity)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Living" value="Living" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Living"} /><label htmlFor="Living">Score room again </label></span><span className="radio-category-text">(living)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Utility" value="Utility" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Utility"} /><label htmlFor="Utility">Take bonus card </label></span><span className="radio-category-text">(utility)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Sleep" value="Sleep" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Sleep"} /><label htmlFor="Sleep">Add 0-2 room tiles to room deck </label></span><span className="radio-category-text">(sleep)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Outdoor" value="Outdoor" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Outdoor"} /><label htmlFor="Outdoor">Take 10,000 gold </label></span><span className="radio-category-text">(outdoor)</span></span>
          <span className='radio-alignment'><span><input type="radio" id="Corridor" value="Corridor" name="chosen_bonus" onChange={(e) => setSelectedDownstairsBonus(e.target.value)} checked={selectedDownstairsBonus === "Corridor"} /><label htmlFor="Corridor">Take a hallway or a staircase </label></span><span className="radio-category-text">(corridor)</span></span>
          {console.log("Selected Downstairs Bonus: ", selectedDownstairsBonus)}
        </div>
      )
    } else {
      return (
        <div>
          <div>
            Complete one more <br />
            "downstairs" room to <br />
            activate bonus
          </div>
          <div>
            <img src="Wine-Cellar.jpg" alt="Downstairs bonus" width="200px" />{/* Finn et bedre bilde.*/}
          </div>
        </div>
      )
    }
  };

  const [corridorBonusUsed, setCorridorbonusUsed] = useState(false); 

  // Styrer advarsel for downstairs bonus valg. Skal vise advarsel etter at 'Confirm' er trykket, og enable 'Lock' Knappen
  const [downstairsBonusConfirmationMessage, setdownstairsBonusConfirmationMessage] = useState(false);

  const [corridorBonusConfirmationMessage, setCorridorBonusConfirmationMessage] = useState(false);

  // When roomCompletionBonus requires confirmation, the OK-button is disabled. (openExits must be 0)
  const [disableModalOKbutton, setDisableModalOKbutton] = useState(false);

  // Trigger de respektive room-bonuses når openExits === 0
  const activateRoomBonus = () => { 
    // console.log("activateRoomBonus running");
    // console.log("completionBonus test: ", players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus); //funker (completionBonus er 'true' når metoden kalles)
    (['Activity', 'Living', 'Downstairs', 'Food', 'Corridor'].includes(players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category) 
    && !players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus) // Disabler OK-knappen når en bonus trenger bekreftelse.
    || corridorBonusConfirmationMessage // Corridor bonus logikken krever en ekstra test.
    || downstairsCorridorBonusChosen ?  // Det gjør downstairsCorridorBonus også
    setDisableModalOKbutton(true) : setDisableModalOKbutton(false); // Re-enabler knappen når bonus er registrert i rommet (spesielt aktuelt for downstairs og Corridor?)
    // 'confirm' setter .completionBonus -> Enabler knappen.
    
    // Outdoor bonus
    if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Outdoor") {
      return (
        <div className="bonus-add-on">
          <div>
            Outdoor bonus: 
          </div>
          <div>
            Collect 10,000 gold
          </div>
          <div>
            <img src="Coin.jpg" alt="Outdoor room bonus: Collect 10,000 gold" />
          </div>
        </div>
      )
      // Sleep bonus
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Sleep") {
      return (
        <div className="bonus-add-on">
          <div>
            Sleep bonus: 
          </div>
          <div>
            Choose 0-2 rooms<br />
            to go on top <br />
            of the room-deck
          </div>
          <div>
            <img src="Bed.jpg" alt="Sleep room bonus: Choose 0-2 rooms to go on top of the room-deck" />
          </div>
        </div>
      )
      // Utility bonus
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Utility") {
      return (
        <div className="bonus-add-on">
          <div>
            Utility bonus: 
          </div>
          <div>
            Draw 2 bonus cards<br />
            and keep 1 of them
          </div>
          <div>
            <img src="Broom.jpg" alt="Utility room bonus: Draw 2 bonus cards and keep 1 of them" />{/* Teksten bør kanskje være sidestilt med bildet */}
          </div>
        </div>
      )
      // Activity bonus
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Activity") {
      return (
        <div className="bonus-add-on">
          <div>
            Activity bonus: 
          </div>
          <div>
            5 extra points!<br />
            <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleActivityBonus(true)}>
              Confirm
            </button>
            <button disabled={!players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleActivityBonus(false)}>
              Undo
            </button>
          </div>
          <div>
            <img src="Broom.jpg" alt="Activity room bonus: Receive 5 extra points!" />
          </div>
        </div>
      )
      // Food room bonus
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Food") {
      return (
        <div className="bonus-add-on">
          <div>
            Food room bonus: 
          </div>
          <div>
            Have an extra turn!<br />
            <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleFoodBonus(true)}>
              Confirm
            </button>
            <button disabled={!players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleFoodBonus(false)}>
              Undo
            </button>
          </div>
          <div>
            <img src="Broom.jpg" alt="Food room bonus: Have an extra turn!" />
          </div>
        </div>
      )
      //Living room bonus
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Living") {
      return ( 
        <div className="bonus-add-on">
          <div>
            Living room bonus: 
          </div>
          <div>
            Room scored anew!<br />
            <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleLivingRoomBonus(true)}>
              Confirm
            </button>
            <button disabled={!players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
              handleLivingRoomBonus(false)}>
              Undo
            </button>
          </div>
          <div>
            <img src="Broom.jpg" alt="Living room bonus: Room scored anew!" />
          </div>
        </div>
      );


    // kontrollerer Downstairs bonus !! Husk at noen Downstairs har bare 1 exit (må automatisk trigge bonus-Modal (Kan man angre addRoom?)) !!
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Downstairs"
    && !downstairsCorridorBonusChosen) {
//      const chosenDownstairsBonus = ""; 
      if (downstairsBonusConfirmationMessage || players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus) { // handleDownstairsCompletionBonusText skal ikke displayes, må erstattes av chosen bonus
        // hvordan oppfører 'downstairsBonusConfirmationMessage' seg på tvers av rom?
        // console.log("Downstairs Lock-warning");
        return (
          <div className="bonus-add-on">
            <div>{/* Hvorfor er det en dobbel <div> her?? For å få knappene på linje, og unngå rot med 'Change choice' knappen */}
              {!players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus 
              && ( <div>
                WARNING!<br />
                When bonus is Locked, <br />
                it cannot be changed! <br /><br />
                Selected bonus: {selectedDownstairsBonus}<br />
              </div>)}
              {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus 
              && ( <div>
                Bonus locked<br /><br />
                Selected bonus: {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].chosenDownstairsBonus}<br />{/* Må bytte mellom locked og unlocked */}
              </div>)}   
              <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => {
                handleDownstairsBonus(selectedDownstairsBonus); 
                // setter room.completionBonus: true, room.chosenDownstairsBonus: selectedDownstairsBonus
                setdownstairsBonusConfirmationMessage(false); // Resettes for neste downstairs-room
                setSelectedDownstairsBonus("N/A"); // Resettes for neste downstairs-room !Må ikke resettes før chosenDownstairsBonus er satt
                // Må sette chosenDownstairsBonus(instance) før selectedDownstairsBonus(state) resettes
                // -> FUNKER IKKE setDisableModalOKbutton(true); // passer på at Modal ikke kan lukkes når/hvis corridor-bonus blir valgt
                // trenger kanskje en if- for å ikke messe opp for andre bonuser 
                }}>
                Lock bonus
              </button>
              { bonusActive // Displayer 'Change choice' knappen bare når det har vært et valg.
              && ( 
                <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => {
                  // må bare displayes dersom bonus kan velges
                  setdownstairsBonusConfirmationMessage(false); // Lar spilleren velge på ny
                  }}>{/* Hva er det som disabler denne knappen? -> ? */}
                  Change choice
                </button>
              )}
            </div>
          </div>
        );
      } else { // for "downstairs": når openExits == 0, displayer "complete 1 more" / bonusvalg
        return ( // legge til alert her? + Exits må bli unmodifiable når rommet er låst. (kan sette room.exits = 0?)
          <div className="bonus-add-on">
            <div>
              Downstairs bonus: 
              {handleDownstairsCompletionBonusText()}
            </div>
            <div>
              <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => 
                setdownstairsBonusConfirmationMessage(true)}>
                Confirm
              </button>
              {/* Cancel-button */}
            </div>
          </div>
        );
      }; // downstairsBonus

    // Corridor bonus 
    } else if (players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Corridor"
    || downstairsCorridorBonusChosen) {
      // console.log("Entering corridor bonus segment");
      // console.log("clickedPlayer:", clickedPlayerIndex, "ClickedRoom: ", clickedRoomIndex);
      return(
      <div className="bonus-add-on">
        <div>
          Corridor room bonus: <br />
        </div>
        {(downstairsCorridorBonusChosen || (!corridorBonusConfirmationMessage 
        && !players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus 
        && !corridorBonusUsed))
        && <div>
          <div>
            Receive an extra Hallway or Staircase!<br /><br />
          </div>
          <div className="radio-buttons">
            <span className='radio-alignment'><span><input type="radio" id="Stairs" value="Stairs" name="chosen_bonus" onChange={(e) => setSelectedCorridorBonus(e.target.value)} checked={selectedCorridorBonus === "Stairs"} /><label htmlFor="Stairs">Stairs </label></span></span>
            <span className='radio-alignment'><span><input type="radio" id="Hallway" value="Hallway" name="chosen_bonus" onChange={(e) => setSelectedCorridorBonus(e.target.value)} checked={selectedCorridorBonus === "Hallway"} /><label htmlFor="Hallway">Hallway </label></span></span>
            {console.log("Raido choice", selectedCorridorBonus)}
          </div>
          <span>
            <button disabled={!selectedCorridorBonus} onClick={() => { // 'Confirm' disabled til bonus er valgt
              if (downstairsCorridorBonusChosen){
                setIsModalOpen(false);
                //setDownstairsCorridorBonusChosen(false);
              } // gjelder når corridorBonus trigges av Downstairs room
              else {
                setDisableModalOKbutton(true); // FIKSET? Denne funker ikke -> Hvorfor ikke? (Resettes øverst i activateRoomBonus -> kan plugge inn en 'if' der) 
                setCorridorBonusConfirmationMessage(true);
              } // Normal corridorBonus
              handleCorridorRoomBonus(selectedCorridorBonus) 
              // --> completionBonus må ikke settes her, den er viktig for å unngå resetting av corridorBonus ved neste turn.
                // set room.chosenCorridorBonus (in handle)
              // openExits trikset må sperres
              }}>
              Confirm
            </button>
            <button disabled={downstairsCorridorBonusChosen} onClick={() => {
              handleCorridorRoomBonus("Cancel"); 
              // setSelectedCorridorBonus(""); // ligger i handleCorridorRoomBonus
              // Setter openExits = 1 og lukker Modalen
              }}>
              Cancel
            </button>
          </span>
        </div>}
          {/* End of choose !corrodorBonusConfirmationMessage && !corridorBonusUsed && !completionBonus */}
        {corridorBonusConfirmationMessage 
        && players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus // satt ved 'confirm' <-- Dette er et problem.
        && !corridorBonusUsed // ikke satt, tror jeg
        && <div>
          <div>
            WARNING!<br />
            When bonus is Locked, <br />
            it cannot be changed! <br /><br />
            Chosen bonus: {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].chosenCorridorBonus}
          </div>
          <span>
            <button disabled={corridorBonusUsed} onClick={() => { // er disabled funksjonell?
              //handleCorridorRoomBonus(selectedCorridorBonus);
              setCorridorBonusConfirmationMessage(false);
              setCorridorbonusUsed(true);
              addRoom(); // Legger til selectedCorridorRoomBonus
              setIsModalOpen(false); // Lukker modalen når bonus-korridoren legges til, og addRoom kjører Toasten
              // openExits trikset må sperres (fikset?)
              }}>
              Lock
            </button>
            <button disabled={corridorBonusUsed} onClick={() => {
              handleCorridorRoomBonus("Cancel");
              }}>
              Abort
            </button>
          </span>
        </div>}
        {/* End of corridorBonusConfirmationMessage 
        && !.completionBonus 
        && !corridorBonusUsed */}
        {(corridorBonusUsed && !players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus) // completionBonus setter ikke ved 'Lock'?? sync eller logisk issue?
        && <div> {/* Trenger jeg !corridorBonusConfirmationMessage her? */}
          You have already received a corridor bonus.<br />
          Only one corridor bonus may be claimed each round.<br />
          <span style={{float:'center'}}>Close exit anyway?<br /></span>
          <span style={{float:'center'}}>WARNING: This action cannot be undone!<br /></span>
          <span>
            <button onClick={() => {
              //setIsModalOpen(false); // Dårlig UX?
              handleCorridorRoomBonus("N/A"); 
                  // setting completionBouns: true
              setSelectedCorridorBonus(""); // Må settes her fordi addRoom ikke kjøres ved 'Yes!'-click.
              // Lukker modal - uønsket, dårlig UX. (hvorfor lukkes den?)
            }}>Yes!</button>
            <button onClick={() => {
              handleCorridorRoomBonus("Cancel");
              // selectedCorridorBonus == ""?
            }}>No</button>
          </span>
        </div>}
        {/* End of corridorBonusUsed && !room.completionBonus */}
        {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus
        && !corridorBonusConfirmationMessage // resett corridorBonusconfirmationMessage
        && <div>
          {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].chosenCorridorBonus}
        </div>}
        {/* Room completed with displayed bonus */}
        <div>
          <img src="Broom.jpg" alt="Corridor room bonus: Extra Stairs or Hallway!" />
        </div>
      </div>
      );//return
    };// corridor
  }; // activateRoomBonus  
  
  const findImageFile = (category, size, bonus, name) => { 
    if (size === 125) {
      //console.log(`IMAGE -> Starting-${name}.jpg`)
      return(`Starting-${name}.jpg`);
    } else if (!bonus) { // Lag checkbox for dropdown til room name. 
      return(`${category}-${size}-${name}.jpg`);
    } else if (bonus) {
      return(`${category}-${size}-${bonus}-${name}.jpg`);
    };
  };

  const endTurnFocus = useRef(null)

  const [isModalOpen, setIsModalOpen] = useState(false); 

  // MODAL (lær mer om Modal, isOpen, onClose, children)
  // isOpen settes fra state variable isModalOpen
  const Modal = ({ isOpen, onClose, children }) => { 

    const okButtonRef = useRef(null);

    useEffect(() => { // Lær om .current
      if(isOpen && okButtonRef.current) { // .current er bare innholdet i okButtonRef? er ikke den 'null' fra start?
        okButtonRef.current.focus();
      }
    }, [isOpen]); // Kjører ved endring i isOpen (når Modalen åpnes eller lukkes (Er det her && okButtonRef.current sjekker om knappen finnes?))

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === 'Escape' && !disableModalOKbutton) {
          onClose();
        }
      };
      if(isOpen) {
        document.addEventListener('keydown', handleKeyDown); // Hvorfor er ikke denne inkludert i const handleKeyDown?
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, onClose]); // trenger denne onClose? Test det.

    if (!isOpen) return null; // isOpen og isModalOpen er det samme ting, eller to forskjellige??

    return ReactDOM.createPortal((
      <div className="modal-overlay">
        <div className="modal-content">
          {/* Ønsker å legge til en modul over bildet, uten at posisjonen til resten av innholdet flyttes - komplisert, gir midlertidig opp denne*/}
          <div className="dynamic-content-area">
            {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].openExits === 0 ? activateRoomBonus() : null}
          </div>
          {children}
          <div>
            <span>Open exits</span><span style={{float:'right'}}>Room bonus</span>
          </div>
          <div>
            <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].openExits === 0} onClick={() => adjustOpenExits(-1)}>-</button>
            <span style={{fontSize: '18px'}}><b> {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].openExits} </b></span>
            <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].openExits === players[clickedPlayerIndex].roomsArray[clickedRoomIndex].exits - 1
            || players[clickedPlayerIndex].roomsArray[clickedRoomIndex].completionBonus} onClick={() => adjustOpenExits(1)}>+</button>
            {clickedRoom.category !== "Downstairs" && <span style={{float:'right', fontSize: '18px'}}>
              <button disabled={players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusesAchieved === 0} onClick={() => adjustRoomBonus(-1)}>-</button>
              <b> {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusValue} x {players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusesAchieved} </b>
              <button disabled={ !(players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category === "Activity") && players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonusesAchieved === players[clickedPlayerIndex].roomsArray[clickedRoomIndex].exits} onClick={() => adjustRoomBonus(1)}>+</button>
              </span>}
          </div >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button ref={okButtonRef} onClick={onClose} disabled={disableModalOKbutton}>OK</button>{/* Hva er onClose? setter isModalOpen=false i <Modal>?*/}
          </div>
        </div>
      </div>), // Portal
      document.getElementById('modal-root')
    ); // Portal
  }; // Modal
  
  
  const [gameStage, setGameStage] = useState("Setup"); // Skal være "Setup"

  const [playerColors, setPlayerColors] = useState({
    "Player 1": "Color",
    "Player 2": "Color",
    "Player 3": "Color",
    "Player 4": "Color",
  });

  const [playerNames, setPlayerNames] = useState ({
    "Player 1": "",
    "Player 2": "",
    "Player 3": "",
    "Player 4": "",
  });

  const handleChangePlayerName = (playerNumber, nameChange) => {
    setPlayerNames(prevPlayerNames => ({
      ...prevPlayerNames,
      [playerNumber]: nameChange,
    }));
  };

  const handleColorChange = (player, selectedColor) => {
    setPlayerColors(prevplayerColors => ({ ...prevplayerColors, [player]: selectedColor }));
    // Lar denne være å frigjøre farger som er deselected? Den tildeler siste farge til aktuell player, slik at ledige farger kan hentes ut.
  };
  
  // Compute available colors dynamically
  const getAvailableColors = (thisPlayer) => {
    const selectedColors = Object.values(playerColors).filter(color => color !== "Color"); // Henter ut farger !== 'Color'
    return ["Color", "Red", "Green", "Blue", "Yellow"] 
    .filter(color => !selectedColors.includes(color) || color === playerColors[thisPlayer]); // Returnerer farger minus valgte farger, men beholder fargen til denne spilleren
  };

  const [disableStartGameButton, setDisableStartGameButton] = useState(true);

  //const handleDisablestartGameButton = () => {
  useEffect (() => {
    if (playerNames["Player 1"] && playerColors["Player 1"] !== "Color" && playerNames["Player 2"] && playerColors["Player 2"] !== "Color") {
      if (playerNames["Player 3"] && playerColors["Player 3"] !== "Color") {
        if (playerNames["Player 4"] && playerColors["Player 4"] !== "Color" ){
          setDisableStartGameButton(false);
        } else if (!playerNames["Player 4"] && !playerColors["Player 4"] !== "Color"){
          setDisableStartGameButton(false);
        } else {
          setDisableStartGameButton(true);
        };
      } else if (!playerNames["Player 3"] && !playerColors["Player 3"] !== "Color") {
        setDisableStartGameButton(false); // sett focus på knappen når 'false'
      } else {
        setDisableStartGameButton(true);
      };
    } else {
      setDisableStartGameButton(true);
    }; // p1 & p2
    // Sjekker for identiske navn 
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if(playerNames[`Player ${i+1}`] && playerNames[`Player ${j+1}`] && playerNames[`Player ${i+1}`] === playerNames[`Player ${j+1}`]) {
          setDisableStartGameButton(true);
        }
      }
    }
  },[playerNames, playerColors]);

  const focusPlayer1 = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect( () => {
    focusPlayer1.current.focus();
  }, []);

  const [randomStartingPlayer, setRandomStartingPlayer] = useState(true);

  const [randomPlayerOrder, setRandomPlayerOrder] = useState(false);

  const handleRandomStartingPlayer = ((e) => {
    setRandomStartingPlayer(e.target.checked);
    // console.log("Random starting player: ", randomStartingPlayer);
  });

  const handleRandomPlayerOrder = ((e) => {
    setRandomPlayerOrder(e.target.checked);
  });

  const setupGame = (() => {
    let arrayOfPlayers = []; // inneholder tall. Kan også bruke 'Player #'
    for (let i = 0; i < 4; i++) {
      if (playerNames[`Player ${i + 1}`] && playerColors[`Player ${i + 1}`]) {
        arrayOfPlayers.push(i); // Lage et array med tall i stedet? (den er tall nå)
        // console.log("Henter spillere fra playerNames og PlayerColor")
      };
    };
    // console.log("Players found: ", arrayOfPlayers, arrayOfPlayers.length);

    if (randomPlayerOrder) { //stokker om på spillerrekkefølgen
      for (let i = arrayOfPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayOfPlayers[i], arrayOfPlayers[j]] = [arrayOfPlayers[j], arrayOfPlayers[i]];
        // console.log("Random player ");
      };
      // console.log("Player order if Random players: ", arrayOfPlayers);
    }; //if randomPlayerOrder

    if (randomStartingPlayer) { // flytter starting player tli posisjon 1
      const numberOfPlayers = arrayOfPlayers.length; // tas inn i 'for'?
      let reorderedArrayOfPlayers = [];
      const startingPlayer = Math.floor(Math.random() * (arrayOfPlayers.length));
      // console.log("STARTING PLAYER: ", startingPlayer);
      for (let i = 0; i < numberOfPlayers; i++) {
        reorderedArrayOfPlayers.push((arrayOfPlayers[i] + startingPlayer) % arrayOfPlayers.length);     
        // console.log("Random starting player", (arrayOfPlayers[i] + startingPlayer) % arrayOfPlayers.length);   
      };
      arrayOfPlayers = reorderedArrayOfPlayers;
      // console.log("Player order if random starting player: ", arrayOfPlayers);
    }; // if randomStartingPlayer

    let setupPlayers = [];
    // console.log("Final arrayOfPlayers: ", arrayOfPlayers);
    for (let i = 0; i < arrayOfPlayers.length; i++){
    // Setter gul spiller til oransje for visibility reasons 
    let tempColor = "";
      if (playerColors[`Player ${arrayOfPlayers[i] + 1}`] === "Yellow") {
        tempColor = "Orange";
      } else {
        tempColor = playerColors[`Player ${arrayOfPlayers[i] + 1}`];
      };
      setupPlayers.push(new Player(playerNames[`Player ${arrayOfPlayers[i] + 1}`], tempColor, i, castleRooms.current.find(room => room.roomName === tempColor)));//, castleRooms.find(room => room.category === tempColor)
      // console.log("Setup players", `Player ${arrayOfPlayers[i] + 1} : `, playerNames[`Player ${arrayOfPlayers[i] + 1}`], tempColor, i, castleRooms.current.find(room => room.roomName === tempColor).roomName);
    };
    // console.log("Final radom player order: ", randomPlayerOrder, arrayOfPlayers);
    setPlayers(setupPlayers);
    setActivePlayer(setupPlayers[0]);
    setClickedPlayerIndex(0);
    // Fjerner Starting-rooms, slik at de ikke kan velges i spillet (avhenger av at de ligger etter hverandre i castle_rooms.json)
    castleRooms.current.splice(castleRooms.current.indexOf(castleRooms.current.find(room => room.size === 125)), 4);
  }); //setupGame

  // Skal sette focus på "Start game" button når den blir aktiv. (Kanskje jeg ikke skal bruke den som en useEffect?)
  useEffect( () => {
    startGameRef.current.focus();
  },[disableStartGameButton]); // listen to disableStartGameButton?

  const startGameRef = useRef(null);

  const debugRoomsArray = ((pindex, rindex) => { // debug, rydd opp etterpå.
  try {
    // console.log("Displaying room-image", players[pindex].name, players[pindex].roomsArray[rindex].roomName);
  } catch (erorr) {
    console.log("failed to display room-image");
  }})

  if (gameStage === "Setup") {
    return(
      <div className="setup-players">
        <div className="player-setup">{/* Trenger en handlePlayerNameChange+ */}
          <label htmlFor="Player 1">Player 1:</label><input ref={focusPlayer1} type="text" name="Player 1" id="Player 1" value={playerNames["Player 1"]} onChange={(e) => {handleChangePlayerName("Player 1", e.target.value)}} ></input>
          <label htmlFor="Color 1">Color:</label><select name="Color 1" id="Color 1"  onChange={(e) => {handleColorChange("Player 1", e.target.value)}}>
            {getAvailableColors("Player 1").map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <div className="player-setup">
          <label htmlFor="Player 2">Player 2:</label><input type="text" name="Player 2" id="Player 2" value={playerNames["Player 2"]} onChange={(e) => {handleChangePlayerName("Player 2", e.target.value)}}></input>
          <label htmlFor="Color 2">Color:</label><select name="Color 2" id="Color 2" onChange={(e) => {handleColorChange("Player 2", e.target.value)}}>
            {getAvailableColors("Player 2").map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <div className="player-setup">
          <label htmlFor="Player 3">Player 3:</label><input type="text" name="Player 3" id="Player 3" value={playerNames["Player 3"]} onChange={(e) => {handleChangePlayerName("Player 3", e.target.value)}}></input>
          <label htmlFor="Color 3">Color:</label><select name="Color 3" id="Color 3" onChange={(e) => {handleColorChange("Player 3", e.target.value)}}>
            {getAvailableColors("Player 3").map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <div className="player-setup">
          <label htmlFor="Player 4">Player 4:</label><input type="text" name="Player 4" id="Player 4" value={playerNames["Player 4"]} onChange={(e) => {handleChangePlayerName("Player 4", e.target.value)}}></input>
          <label htmlFor="Color 4">Color:</label><select name="Color 4" id="Color 4" onChange={(e) => {handleColorChange("Player 4", e.target.value)}}>
            {getAvailableColors("Player 4").map(color => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="random-starting-player">Random starting player</label>
          <input type="checkbox" id="random-starting-player" name="random-starting-player" checked={randomStartingPlayer} onClick={(e) => handleRandomStartingPlayer(e)} />
          <label htmlFor="random-player-order">Random player order</label>
          <input type="checkbox" id="random-player-order" name="random-player-order" onClick={(e) => handleRandomPlayerOrder(e)} />
          <button className="start-game-button" ref={startGameRef} disabled={disableStartGameButton} onClick={() => {setGameStage("Play"); setupGame()}}>Start game</button>
        </div>
      </div>
    )
  } else if (gameStage === "Play") {
    return (
      <div>
        <Toast message={toastMessage.message} show={showToast}/>{/* Legg Toasten i en portal */}
        <h1>Castles Score Keeper</h1>
        <div>
          {clickedRoom && (
            <Modal isOpen={isModalOpen} onClose={ () => {setIsModalOpen(false); updateTotalScore(0)}}>
              {/* Legg til exit og bonus-handling i players[index].roomsArray[index].openExits / ...bonusesAchieved => setPlayers i egen handler funksjon*/}
                  <span>
                    <img src={findImageFile(players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].size, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonus, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].roomName)} style={{width: imageSize[players[clickedPlayerIndex].roomsArray[clickedRoomIndex].size] * 2}} alt="selectedRoom" />
                    <img src={findImageFile(players[clickedPlayerIndex].roomsArray[clickedRoomIndex].category, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].size, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].bonus, players[clickedPlayerIndex].roomsArray[clickedRoomIndex].roomName)} style={{width: imageSize[clickedRoom.size] * 2}} alt="selectedRoom" />
                  </span>
            </Modal>
          )}
        </div>
        <table border="0">
          <thead>
            <tr key="playerheader">{/*Bredden tilpasser seg innholdet. men overstiger ikke, og kutter heller ikke teksten*/}
              <th width="20" align="left">Player</th>
              <th width="50" align="left">Score</th>
              <th width="80" align="left">Category</th>
              <th width="30" align="left">Size</th>
              <th width="50" align="left">Bonus</th>
              <th width="80" align="left">Add Room</th>
              <th align="left">End Turn</th>
            </tr>
          </thead>
          <tbody>
          {players.map((player, playerIndex) => {
            return (
              <>
                <tr key={player.name + "turn"} style={{backgroundColor: getPlayerBackgroundColor(player.color)}}>
                  <td style={{ color: player.color }}><b>{player.name}</b></td>
                  <td align="center">{player.totalScore}</td>
                  <td align="center"> 
                    {/* Dropdown for categories */}
                    {player.name === activePlayer.name && <select name={`${player.name}-category`} placeholder ="placeholder" value={player.selectedRoomCategory} onChange={(e) => handleCategoryChange(e.target.value)}> 
                      {categories.map(category => (
                        <option key={category} value={category}>{category}{/*console.log(player.name, player.selectedRoomCategory, player.selectedRoomSize)*/}</option> // Må resettes ved submit - implementer player.
                      ))}
                    </select>}
                  </td>
                  <td>
                    {/* Dropdown for roomSize */}
                    {player.name === activePlayer.name 
                    && activePlayer.availableRoomSizes.length > 1 
                    && <select name={`${player.name}-roomSize`} placeholder ="placeholder" value={player.selectedRoomSize} onChange={(e) => handleRoomSizeChange(e.target.value)}> 
                      {player.availableRoomSizes.map(roomSize => ( // Erstattes med tilgjengelige roomSize fra castleRooms
                        <option key={roomSize} value={roomSize}>{roomSize}</option>
                      ))}
                    </select>}
                  </td>
                  <td>
                    {/* Dropdown for roomBonuses */}
                    {player.name === activePlayer.name 
                    && player.availableBonuses.length > 1 
                    && <select name={`${player.name}-selectedRoomBonus`} placeholder ="placeholder" value={player.selectedRoomBonus} onChange={(e) => handleRoomBonusChange(e.target.value)}>
                      {player.availableBonuses.map(bonus => (
                          <option key={bonus} value={bonus}>{bonus}</option>
                      ))}
                    </select>}
                  </td>
                  <td>
                  {player.name === activePlayer.name 
                  && <button  disabled={player.name !== activePlayer.name || player.roomAdded} type='button' onClick={() => addRoom()}>Add Room</button>}
                  </td>
                  <td>
                  {player.name === activePlayer.name 
                  && <button ref={endTurnFocus} type='button' onClick={() => {endTurn()}}>
                    End Turn</button>}
                  </td>
                </tr>
                
                {/* RoomsArray */}
                <tr key={player.name + "rooms"} style={{backgroundColor: getPlayerBackgroundColor(player.color)}}>
                  <td colSpan="77">
                    <div className="room-container">
                      {player.roomsArray.map((room, index) => ( // index kun til debug
                        <div className="room-image-wrapper" style={{flex: `0 0 ${imageSize[room.size]}px`}}>
                          {debugRoomsArray(playerIndex, index)/* Debugging */}
                          <button 
                            disabled={player.name !== activePlayer.name} 
                            onClick={() => {                      
                              setClickedRoom(room); // Kan denne erstattes med en annen del? room.id? players[i].roomsArray[i].* må oppdateres
                              // Er det egentlig player index og roomsArray index jeg bør bruke?
                              // Bør indeksene settes til null etter bruk?
                              // setClickedPlayerIndex(players.indexOf(player)); // Tror denne er redundant
                              setClickedRoomIndex(player.roomsArray.indexOf(room)); // Hvis det er flere like rom i roomsArray, feiler denne.
                              // console.log("ckickedRoomIndex: ", player.roomsArray.indexOf(room));
                              setIsModalOpen(true);
                            }}>
                            {/* console.log(`${room.category}-${room.size}-${room.bonus}-${room.roomName}.jpg`) */}
                            <img src={findImageFile(room.category, room.size, room.bonus, room.roomName)} alt={`${room.category} room of size ${room.size}`} style={{width: '100%'}} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* ScoresArray */}
                <tr key={player.name + "scores"} style={{backgroundColor: getPlayerBackgroundColor(player.color)}}>
                  <td colSpan="77"> 
                    <div className="scores-container">
                      {player.scoresArray.map((score, index) => (
                        player.roomsArray[index] 
                          ? <div className="score-item" style={{flex: `0 0 ${imageSize[player.roomsArray[index].size]}px`}}>
                              {score}
                            </div> : <div>Loading scores</div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr style={{color: "white"}}><td>.</td></tr>{/* remove */}
              </>
            );
          })}
          </tbody>
        </table>
      </div>
    ); // return
  }; // if gameStage === "Play"
} // function PlayCastles

export default PlayCastles;
