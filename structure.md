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
    attribute->set
      color
    populate
    kill
    connect
    transform culture
      color
      size->grow/shrink->colony
    transform colony
      size->grow/shrink


// LET THERE BE LIGHT

Populate -> (Layer)
  spawn culutre (group)
    points
    color
    size
    relationships

    ^^^^^^^
    repeat


// ENVIRONMENTAL FACTORS
Environment
  create
  kill
  share
  newColony
  killColony
  breath


// EXECUTE ENVIRONMENTAL FACTORS
God->FACTORS //loop
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











