Add Layer
  Add Grid
  //Set Grid Transform

Add Layer -> Active Layer -> (metagenome)
  
  Culture -> new Group (population)
    states
      kill
      create
      scale
      color
    styles->set
      color
    populateColony
    killColony
    connectColony
    transform culture
      color
      size->grow/shrink->colony
    transform colony
      size->grow/shrink


// LET THERE BE LIGHT

populateOrganism -> (Layer)
  new Culture (group)
    points
    color
    size
    relationships

    ^^^^^^^
    repeat


// ENVIRONMENTAL FACTORS
factors
  create
  kill
  share
  newCulture
  killCulture


// EXECUTE ENVIRONMENTAL FACTORS
execute->FACTORS //loop
  create
  kill
  share
  newCulture
  killCulture

// LET THERE BE LIFE
  Organism->animate
    Culture->change
      true->till change met
        set false
    change->Colony
      true->till change met
        set false
        //while true execute -> until false











