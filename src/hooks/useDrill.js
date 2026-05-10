import { useState, useEffect, useCallback, useRef } from 'react'
import * as SimpleQueue from '../engines/simpleQueue.js'

// Registry of available engines — add new engines here to make them selectable.
export const ENGINES = {
  simpleQueue: SimpleQueue,
}

export function useDrill(pool, { engine = SimpleQueue, floatSize = 7 } = {}) {
  const [state, setState] = useState(() => engine.init(pool, floatSize))

  // Reinitialize when the pool reference changes (options changed).
  const poolRef = useRef(pool)
  useEffect(() => {
    if (pool !== poolRef.current) {
      poolRef.current = pool
      setState(engine.init(pool, floatSize))
    }
  }, [pool, engine, floatSize])

  const onCorrect = useCallback(() => setState(s => engine.onCorrect(s)), [engine])
  const onWrong   = useCallback(() => setState(s => engine.onWrong(s)),   [engine])
  const restart   = useCallback(() => setState(engine.init(poolRef.current, floatSize)), [engine, floatSize])

  return {
    currentCard:  state.float[0] ?? null,
    streak:       state.streak,
    totalCorrect: state.totalCorrect,
    totalWrong:   state.totalWrong,
    remaining:    state.pool.length,
    done:         state.float.length === 0,
    onCorrect,
    onWrong,
    restart,
  }
}
