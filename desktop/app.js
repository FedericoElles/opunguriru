

var tagLines = {
  en: [
    'Never grill alone',
    'Make every charcoal count',  
    'Come together around the fire',
    'Established 2 million years B.C.',
    'Burnin’ for You',
    'Share the fire',
    'The hottest shared economy entry'        
  ]
};

var tags = {
  tagLine: document.getElementById('tagLine')
};

tags.tagLine.innerHTML = '"' + 
  tagLines.en[Math.floor(Math.random()*tagLines.en.length)] +
  '"';