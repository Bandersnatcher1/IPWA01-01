    
    //Funktion zum Speichern von Einstellungen (Schriftkultur)
    function setdirection(direction) {
        localStorage.setItem("pageDirection", direction);
        applyDirection();
    }

    function applyDirection() {
        const savedDirection = localStorage.getItem("pageDirection") || "ltr";
        const nav = document.getElementById("mainNavigation");
        if (nav) {
            nav.setAttribute("dir", savedDirection);
        }
    }

    applyDirection();
    
    //Suchfunktion Header
    function handleHeaderSearch(event) {
        event.preventDefault();                                                                 //Verhindert, dass die Seite bei Absenden der Suche neu lädt
        const searchTerm = sanitizeSearchInput(document.getElementById("headerSearch").value);  //Ruft Funktion zur Bereinigung des Eingabetexts auf 
        document.getElementById("searchResult").textContent = "Suche nach: " + searchTerm;
    }
        document.getElementById("headerSearchForm").addEventListener("submit", handleHeaderSearch); //Verbinden des Suchformulars mit der Funktion

    //Filterfunktionen (Real Time Search) für beide Tabellen
    function filterTable(tableId, inputId) {                                    //Übergibt TableID und InputID an die Funktion
        const searchField = document.getElementById(inputId);                   //Speichert inputID in Variable
        const searchTerm = sanitizeSearchInput(searchField.value);              //Ruft Funktion zur Bereinigung des Eingabetexts auf
        const rows = document.querySelectorAll("#" + tableId + " tbody tr");

        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();                      //Wandelt Eingabetext in Kleinbuchstaben um
            row.style.display = rowText.includes(searchTerm) ? "" : "none";     //Vergleicht nur Eingabetext mit Tabellentext, es wird kein Text in die Seite selbst geschrieben (Schutz1)
        });
    }

    function sanitizeSearchInput(text) {
        const shortened = text.trim().slice(0, 50).toLowerCase();               //Entfernt Leerzeichen am Rand des Eingabetexts
        return shortened.replace(/[^a-zäöüß0-9 .,()\-]/g, "");                  //Enthält eine Whitelist mit zulässigen Zeichen/Buchstaben und entfernt gleichzeitig unzulässige Zeichen, dient auch als Eingabesicherung (<, >, etc) (Schutz2)
    }
    
  
    // Sortierfunktion für beide Tabellen
      const sortDirections = {};                              //Speichert für jede Tabelle welche Sortierrichtung zuletzt benutzt wurde

    function sortTable(tableId, columnIndex) {                //Funktion, die die jeweilige Tabelle über die ID sucht
      const table = document.getElementById(tableId);         //Auslesen der jeweiligen Tabelle über die ID
      const tbody = table.querySelector("tbody");             //Auslesen der jeweiligen Daten in tbody der jeweiligen Tabelle
      const key = tableId + "-" + columnIndex;                //Unter "key" wird für jede Tabellenspalte die jeweilige Sortierrichtung gespeichert
      const ascending = sortDirections[key] === false;        //Prüft, ob zuletzt absteigend sortiert wurde
      sortDirections[key] = ascending;
      const rows = Array.from(tbody.querySelectorAll("tr"));  //Erstellt aus der Zeilenliste ein Array zum sortieren
    

    rows.sort((rowA, rowB) => {                                     //Vergleicht jeweils zwei Zeilentexte der jeweiligen Tabelle miteinander
      const textA = rowA.children[columnIndex].textContent.trim();  //Leerzeichen am Anfang und Ende der Zeilentexte werden entfernt
      const textB = rowB.children[columnIndex].textContent.trim();

      const numberA = parseGermanNumber(textA);                           //textA wird in parseNumber übergeben und nach Durchlauf der Hilfsfunktion bereinigt zurückgegeben
      const numberB = parseGermanNumber(textB);

      if (!isNaN(numberA) && !isNaN(numberB)) {                      //Nur wenn beide Werte Zahlen sind, werden sie miteinander verglichen, ansonsten wird auf den Textvergleich unten zurückgegriffen
        return ascending ? numberA - numberB : numberB - numberA;    //Wenn "ascending" wahr ist, wird A vorangestellt, wenn es negativ ist, ansonsten umgekehrt
      }

        return ascending ? textA.localeCompare(textB, "de") : textB.localeCompare(textA, "de");
    });


    rows.forEach(row => tbody.appendChild(row));                    //Hängt jede Zeile in der neuen Reihenfolge an den tbody, Zeile wird hier nur verschoben und nicht kopiert

    //Pfeile für die Sortierreihenfolge in den Tabellenüberschriften
    const headerCells = table.querySelectorAll("thead th");
    headerCells.forEach((cell, index) => {
      cell.removeAttribute("aria-sort");                                        //Entfernen des Attributs um mehrere Pfeile zu vermeiden
      if (index === columnIndex) {
        cell.setAttribute("aria-sort", ascending ? "ascending" : "descending"); //Setzen der Pfeile in der Überschrift, deren Spalte gerade sortiert wurde
      }
    });

    }


    function connectHeaders(tableId) {
      const table = document.getElementById(tableId);           //Liest die ID der Tabelle aus und speichert sie in "table"
      if (!table) {
        return;
      }

      const headers = table.querySelectorAll("thead th");       //Sucht alle Spaltenüberschriften aus dem Tabellenkopf und speichert sie in einer Liste
      headers.forEach((header, index) => {                       //Für jede Tabellenüberschrift wird die Funktion ausgeführt und es werden die Überschrift und die Indexnummer gesetzt
        header.addEventListener("click", () => {                //Fügt der Tabellenüberschrift die Klick-Funktion hinzu
          sortTable(tableId, index);                            
        });
      });
    }

    connectHeaders("countryTable");
    connectHeaders("companyTable");

    //Hilfsfunktion zum Sortieren von Zahlen
    function parseGermanNumber(text) {
      return parseFloat(text.replace(/\./g, "").replace(",", "."));   //Entfernt alle Punkte und Kommas aus den Zahlen un Texten. Mit parseFloat wird der bereinigte Text in Zahlen umgewandelt, bei reinem Text ohne Ziffern wird nichts gemacht (NaN)
    }

    //Funktion für Formulareingabe
    function cleanText(text, maxLength) {
      return text.trim().slice(0, maxLength).replace(/[<>]/g, "");  //cleanText entfernt spitze Klammern, schneidet Text ab und entfernt Leerzeichen am Rand
    }

    function cleanPhone(text) {
      return text.trim().slice(0, 25).replace(/[^0-9+\-\/() ]/g, "");  //Erlaubt nur Ziffern für die Eingabe von Telefonnummern
    }

    function handleContactForm(event) {
      event.preventDefault();

      const firstName = cleanText(document.getElementById("fname").value, 50);    //Auch relevant für die Ausgabe des Formulars
      const lastName = cleanText(document.getElementById("lname").value, 50);
      const phone = cleanPhone(document.getElementById("tnumber").value);         
      const message = cleanText(document.getElementById("tarea").value, 1000);

      const status = document.getElementById("formOutput");
      if (firstName === "" || lastName === "" || message === "") {
        status.textContent = "Bitte füllen Sie alle Pflichtfelder aus.";
        return;
      }
      status.textContent = "\n" +"Vielen Dank, Ihre Eingaben wurden geprüft. Bitte beachten Sie, dass keine Nachricht versendet wurde, da es sich nur um eine Simulation handelt.\n\n" +
      "Ihre Eingaben, die Sie an uns übermittelt haben:\n\n" +
      "Vorname: " + firstName + "\n" +
      "Nachname: " + lastName + "\n" +
      "Telefon: " + (phone || "nicht angegeben") + "\n" +
      "Nachricht: " + message;
      event.target.reset();
    }

    document.getElementById("tarea").addEventListener("submit", handleContactForm);

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", handleContactForm);
    }