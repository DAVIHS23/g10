function openQuelle(evt, quelleName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(quelleName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  // Funktion, um das erste Tab beim Laden der Seite zu öffnen
function openDefaultTab() {
    // Öffnet das erste Tab
    document.getElementById("defaultOpen").click();
}

// Fügen Sie ein Event Listener hinzu, um die openDefaultTab-Funktion beim Laden der Seite aufzurufen
document.addEventListener("DOMContentLoaded", openDefaultTab);