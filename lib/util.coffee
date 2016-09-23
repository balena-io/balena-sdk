memoizee = require('memoizee')
_ = require('lodash')

exports.notImplemented = ->
  throw new Error("The method is not implemented.")

memoizeNormalizer = ([ deps, opts ]) ->
  _(opts)
    .keys()
    .map (k) -> [ k, opts[k] ]
    .sort()
    .map ([ k, v ]) -> "#{k}=#{v}"
    .join(';') or ''

exports.memoize = (fn) -> memoizee(fn, length: 2, normalizer: memoizeNormalizer)
