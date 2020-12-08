# (C) Uri Wilensky. https://github.com/NetLogo/Tortoise

StrictMath                   = require('shim/strictmath')
formatFloat                  = require('util/formatfloat')
{ checks, getTypeOf, types } = require('engine/core/typechecker')

class Validator

  constructor: (@bundle, @dumper) ->
    agentSetOrList         = [types.AgentSet, types.List]
    list                   = [types.List]
    number                 = [types.Number]
    reporter               = [types.ReporterLambda]
    string                 = [types.String]
    stringOrList           = [types.String, types.List]
    stringOrListOrAgentSet = [types.String, types.List, types.AgentSet]
    wildcard               = [types.Wildcard]

    @commonArgChecks = {
      agentSetOrList:                  @checkArgTypes(agentSetOrList)
      list:                            @checkArgTypes(list)
      list_number_number:              @checkArgTypes(list, number, number)
      number:                          @checkArgTypes(number)
      number_agentSetOrList:           @checkArgTypes(number, agentSetOrList)
      number_number:                   @checkArgTypes(number, number)
      number_stringOrList:             @checkArgTypes(number, stringOrList)
      number_stringOrList_wildcard:    @checkArgTypes(number, stringOrList, wildcard)
      reporter_agentSetOrList:         @checkArgTypes(reporter, agentSetOrList)
      reporter_list:                   @checkArgTypes(reporter, list)
      stringOrList:                    @checkArgTypes(stringOrList)
      string_number_number:            @checkArgTypes(string, number, number)
      wildcard_list:                   @checkArgTypes(wildcard, list)
      wildcard_stringOrList:           @checkArgTypes(wildcard, stringOrList)
      wildcard_stringOrListOrAgentSet: @checkArgTypes(wildcard, stringOrListOrAgentSet)
    }

  # (Boolean, String, Array[Any]) => Unit
  error: (messageKey, messageValues...) ->
    message = @bundle.get(messageKey, messageValues.map( (val) -> if typeof(val) is "function" then val() else val )...)
    throw new Error(message)

  # (Number) => Number
  checkLong: (value) ->
    if value > 9007199254740992 or value < -9007199254740992
      @error('_ is too large to be represented exactly as an integer in NetLogo', formatFloat(value))
    value

  # (Number) => Number
  checkNumber: (result) ->
    if Number.isNaN(result)
      @error('math operation produced a non-number')
    if result is Infinity
      @error('math operation produced a number too large for NetLogo')

    result

  # (Array[NLType]) => String
  listTypeNames: (types) ->
    names    = types.map( (type) -> type.niceName() )
    nameList = names.join(" or ")
    if ['A', 'E', 'I', 'O', 'U'].includes(nameList.charAt(0).toUpperCase())
      "an #{nameList}"
    else
      "a #{nameList}"

  # (String, Any, String) => String
  typeError: (prim, value, expectedText) ->
    valueType = getTypeOf(value)
    valueText = if valueType is types.Nobody
      "nobody"
    else if valueType is types.Wildcard
      "any value"
    else
      "the #{valueType.niceName()} #{@dumper(value)}"

    @bundle.get("_ expected input to be _ but got _ instead.", prim, expectedText, valueText)

  # (String, Boolean, Any, Array[NLType]) => Unit
  checkTypeError: (prim, condition, value, expectedTypes...) ->
    if condition
      expectedText = @listTypeNames(expectedTypes)
      throw new Error(@typeError(prim, value, expectedText))

    return

  # (Array[Array[NLType]]) => (String, Array[Any]) => Unit
  checkArgTypes: (argTypes...) -> (prim, args) =>
    if args.length isnt argTypes.length
      throw new Error("Given a different number of argument types versus argument values to check.")

    for i in [0...args.length]
      if not argTypes[i].some( (type) -> type.isOfType(args[i]) )
        throw new Error(@typeError(prim, args[i], @listTypeNames(argTypes[i])))

    return

  # (String, Array[NLType]) => (Any) => Unit
  checkValueType: (prim, types...) -> (value) =>
    if not types.some( (type) -> type.isOfType(value) )
      throw new Error(@typeError(prim, value, @listTypeNames(types)))

    value

module.exports = Validator
