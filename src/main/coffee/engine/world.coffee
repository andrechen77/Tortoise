define(['integration/random', 'integration/strictmath', 'engine/agentkind', 'engine/agents', 'engine/builtins'
      , 'engine/exception', 'engine/link', 'engine/nobody', 'engine/observer', 'engine/patch', 'engine/ticker'
      , 'engine/turtle', 'engine/worldlinks', 'engine/topology/box', 'engine/topology/horizcylinder'
      , 'engine/topology/torus', 'engine/topology/vertcylinder', 'integration/lodash']
     , ( Random,               StrictMath,               AgentKind,          Agents,          Builtins
      ,  Exception,          Link,          Nobody,          Observer,          Patch,          Ticker
      ,  Turtle,          WorldLinks,          Box,                   HorizCylinder
      ,  Torus,                   VertCylinder,                   _) ->

  class World

    id: 0
    observer: undefined
    ticker:   undefined

    _links:             undefined
    _nextLinkId:        undefined
    _nextTurtleId:      undefined
    _patches:           undefined
    _patchesAllBlack:   undefined
    _patchesWithLabels: undefined
    _topology:          undefined
    _turtles:           undefined
    _turtlesById:       undefined

    #@# I'm aware that some of this stuff ought to not live on `World`
    constructor: (@globals, @patchesOwn, @turtlesOwn, @linksOwn, @agentSet, @updater, @breedManager, @minPxcor, @maxPxcor
                , @minPycor, @maxPycor, @patchSize, @wrappingAllowedInX, @wrappingAllowedInY, turtleShapeList
                , linkShapeList, @interfaceGlobalCount) ->
      @breedManager.reset()
      @agentSet.reset()
      @updater.collectUpdates()
      @updater.update("world", 0, {
        worldWidth: Math.abs(@minPxcor - @maxPxcor) + 1,
        worldHeight: Math.abs(@minPycor - @maxPycor) + 1,
        minPxcor: @minPxcor,
        minPycor: @minPycor,
        maxPxcor: @maxPxcor,
        maxPycor: @maxPycor,
        linkBreeds: "XXX IMPLEMENT ME",
        linkShapeList: linkShapeList,
        patchSize: @patchSize,
        patchesAllBlack: @_patchesAllBlack,
        patchesWithLabels: @_patchesWithLabels,
        ticks: -1,
        turtleBreeds: "XXX IMPLEMENT ME",
        turtleShapeList: turtleShapeList,
        unbreededLinksAreDirected: false
        wrappingAllowedInX: @wrappingAllowedInX,
        wrappingAllowedInY: @wrappingAllowedInY
      })

      @observer = new Observer(updater)
      @ticker   = new Ticker(updater, @id)

      @_links           = new WorldLinks(@linkCompare)
      @_nextLinkId      = 0
      @_nextTurtleId    = 0
      @_patches         = []
      @_patchesAllBlack = true
      @_topology        = null
      @_turtles         = []
      @_turtlesById     = {}

      @resize(@minPxcor, @maxPxcor, @minPycor, @maxPycor)


    createPatches: ->
      nested =
        for y in [@maxPycor..@minPycor]
          for x in [@minPxcor..@maxPxcor]
            new Patch((@width() * (@maxPycor - y)) + x - @minPxcor, x, y, this) #@# ID should not be generated inline
      # http://stackoverflow.com/questions/4631525/concatenating-an-array-of-arrays-in-coffeescript
      @_patches = [].concat nested... #@# I don't know what this means, nor what that comment above is, so it's automatically awful
      for patch in @_patches
        @updater.updated(patch, "pxcor", "pycor", "pcolor", "plabel", "plabelcolor")
    topology: -> @_topology
    links: () ->
      new Agents(@_links.toArray(), @breedManager.get("LINKS"), AgentKind.Link)
    turtles: () -> new Agents(@_turtles, @breedManager.get("TURTLES"), AgentKind.Turtle)
    turtlesOfBreed: (breedName) ->
      breed = @breedManager.get(breedName)
      new Agents(breed.members, breed, AgentKind.Turtle)
    patches: => new Agents(@_patches, @breedManager.get("PATCHES"), AgentKind.Patch)
    resize: (minPxcor, maxPxcor, minPycor, maxPycor) ->

      if not (minPxcor <= 0 <= maxPxcor and minPycor <= 0 <= maxPycor)
        throw new Exception.NetLogoException("You must include the point (0, 0) in the world.")

      # For some reason, JVM NetLogo doesn't restart `who` ordering after `resize-world`; even the test for this is existentially confused. --JAB (4/3/14)
      oldNextTId = @_nextTurtleId
      @clearTurtles()
      @_nextTurtleId = oldNextTId

      @minPxcor = minPxcor
      @maxPxcor = maxPxcor
      @minPycor = minPycor
      @maxPycor = maxPycor
      if @wrappingAllowedInX and @wrappingAllowedInY #@# `Topology.Companion` should know how to generate a topology from these values; what does `World` care?
        @_topology = new Torus(@minPxcor, @maxPxcor, @minPycor, @maxPycor, @patches, @getPatchAt) #@# FP a-go-go
      else if @wrappingAllowedInX
        @_topology = new VertCylinder(@minPxcor, @maxPxcor, @minPycor, @maxPycor, @patches, @getPatchAt)
      else if @wrappingAllowedInY
        @_topology = new HorizCylinder(@minPxcor, @maxPxcor, @minPycor, @maxPycor, @patches, @getPatchAt)
      else
        @_topology = new Box(@minPxcor, @maxPxcor, @minPycor, @maxPycor, @patches, @getPatchAt)
      @createPatches()
      @patchesAllBlack(true)
      @patchesWithLabels(0)
      @updater.updated(this, "width", "height", "minPxcor", "minPycor", "maxPxcor", "maxPycor")
      return

    width: () -> 1 + @maxPxcor - @minPxcor #@# Defer to topology x2
    height: () -> 1 + @maxPycor - @minPycor
    getPatchAt: (x, y) =>
      trueX  = (x - @minPxcor) % @width()  + @minPxcor # Handle negative coordinates and wrapping
      trueY  = (y - @minPycor) % @height() + @minPycor
      index  = (@maxPycor - StrictMath.round(trueY)) * @width() + (StrictMath.round(trueX) - @minPxcor)
      @_patches[index]
    getTurtle: (id) -> @_turtlesById[id] or Nobody
    getTurtleOfBreed: (breedName, id) ->
      turtle = @getTurtle(id)
      if turtle.breed.name.toUpperCase() is breedName.toUpperCase() then turtle else Nobody
    removeLink: (id) ->
      link = @_links.find((link) -> link.id is id)
      @_links = @_links.remove(link)
      if @_links.isEmpty()
        @unbreededLinksAreDirected = false
        @updater.updated(this, "unbreededLinksAreDirected")
      return
    removeTurtle: (id) -> #@# Having two different collections of turtles to manage seems avoidable
      turtle = @_turtlesById[id]
      @_turtles.splice(@_turtles.indexOf(turtle), 1)
      delete @_turtlesById[id]
    patchesAllBlack: (val) -> #@# Varname
      @_patchesAllBlack = val
      @updater.updated(this, "patchesAllBlack")
    patchesWithLabels: (val) ->
      @_patchesWithLabels = val
      @updater.updated(this, "patchesWithLabels")
    clearAll: ->
      @globals.clear(@interfaceGlobalCount)
      @clearTurtles()
      @createPatches()
      @_nextLinkId = 0
      @patchesAllBlack(true)
      @patchesWithLabels(0)
      @ticker.clear()
      return
    clearTurtles: ->
      # We iterate through a copy of the array since it will be modified during
      # iteration.
      # A more efficient (but less readable) way of doing this is to iterate
      # backwards through the array.
      #@# I don't know what this is blathering about, but if it needs this comment, it can probably be written better
      @turtles().forEach((turtle) ->
        try
          turtle.die()
        catch error
          throw error if not (error instanceof Exception.DeathInterrupt)
      )
      @_nextTurtleId = 0
      return
    clearPatches: ->
      @patches().forEach((patch) -> #@# Oh, yeah?
        patch.setPatchVariable(2, 0)   # 2 = pcolor
        patch.setPatchVariable(3, "")    # 3 = plabel
        patch.setPatchVariable(4, 9.9)   # 4 = plabel-color
        for i in [Builtins.patchBuiltins.size...patch.vars.length] #@# ABSTRACT IT!
          patch.setPatchVariable(i, 0)
      )
      @patchesAllBlack(true)
      @patchesWithLabels(0)
      return
    createTurtle: (turtle) ->
      turtle.id = @_nextTurtleId++ #@# Why are we managing IDs at this level of the code?
      @updater.updated(turtle, Builtins.turtleBuiltins...)
      @_turtles.push(turtle)
      @_turtlesById[turtle.id] = turtle
      turtle
    ###
    #@# We shouldn't be looking up links in the tree everytime we create a link; JVM NL uses 2 `LinkedHashMap[Turtle, Buffer[Link]]`s (to, from) --JAB (2/7/14)
    #@# The return of `Nobody` followed by clients `filter`ing against it screams "flatMap!" --JAB (2/7/14)
    ###
    createLink: (directed, from, to) ->
      if from.id < to.id or directed #@# FP FTW
        end1 = from
        end2 = to
      else
        end1 = to
        end2 = from
      if @getLink(end1.id, end2.id) is Nobody
        link = new Link(@_nextLinkId++, directed, end1, end2, this) #@# Managing IDs for yourself!
        @updater.updated(link, Builtins.linkBuiltins...)
        @updater.updated(link, Builtins.linkExtras...)
        @updater.updated(link, Builtins.turtleBuiltins.slice(1)...) #@# See, this update nonsense is awful
        @_links.insert(link)
        link
      else
        Nobody
    createOrderedTurtles: (n, breedName) -> #@# Clarity is a good thing
      turtles = _(0).range(n).map((num) => @createTurtle(new Turtle(this, (10 * num + 5) % 140, (360 * num) / n, 0, 0, @breedManager.get(breedName)))).value()
      new Agents(turtles, @breedManager.get(breedName), AgentKind.Turtle)
    createTurtles: (n, breedName) -> #@# Clarity is still good
      turtles = _(0).range(n).map(=> @createTurtle(new Turtle(this, 5 + 10 * Random.nextInt(14), Random.nextInt(360), 0, 0, @breedManager.get(breedName)))).value()
      new Agents(turtles, @breedManager.get(breedName), AgentKind.Turtle)
    getNeighbors: (pxcor, pycor) -> @topology().getNeighbors(pxcor, pycor)
    getNeighbors4: (pxcor, pycor) -> @topology().getNeighbors4(pxcor, pycor)
    createDirectedLink: (from, to) ->
      @unbreededLinksAreDirected = true
      @updater.updated(this, "unbreededLinksAreDirected")
      @createLink(true, from, to)
    createDirectedLinks: (source, others) -> #@# Clarity
      @unbreededLinksAreDirected = true
      @updater.updated(this, "unbreededLinksAreDirected")
      links = _(others.toArray()).map((turtle) => @createLink(true, source, turtle)).filter((other) -> other isnt Nobody).value()
      new Agents(links, @breedManager.get("LINKS"), AgentKind.Link)
    createReverseDirectedLinks: (source, others) -> #@# Clarity
      @unbreededLinksAreDirected = true
      @updater.updated(this, "unbreededLinksAreDirected")
      links = _(others.toArray()).map((turtle) => @createLink(true, turtle, source)).filter((other) -> other isnt Nobody).value()
      new Agents(links, @breedManager.get("LINKS"), AgentKind.Link)
    createUndirectedLink: (source, other) ->
      @createLink(false, source, other)
    createUndirectedLinks: (source, others) -> #@# Clarity
      links = _(others.toArray()).map((turtle) => @createLink(false, source, turtle)).filter((other) -> other isnt Nobody).value()
      new Agents(links, @breedManager.get("LINKS"), AgentKind.Link)
    getLink: (fromId, toId) ->
      link = @_links.find((link) -> link.end1.id is fromId and link.end2.id is toId)
      if link?
        link
      else
        Nobody

    linkCompare: (a, b) => #@# Heinous
      if a is b
        0
      else if a.id is -1 and b.id is -1
        0
      else if a.end1.id < b.end1.id
        -1
      else if a.end1.id > b.end1.id
        1
      else if a.end2.id < b.end2.id
        -1
      else if a.end2.id > b.end2.id
        1
      else if a.breed is b.breed
        0
      else if a.breed is @breedManager.get("LINKS")
        -1
      else if b.breed is @breedManager.get("LINKS")
        1
      else
        throw new Exception.NetLogoException("We have yet to implement link breed comparison")

)
