import {
    BaseNode,
    CSSPath,
    CSSPathPassed,
    MessageEvents,
    NodeInput,
    NodeLink,
    ResponseEvents,
    ScrapperActions
} from './types'

export type Message =
    | {
          type: MessageEvents.init
          ok: boolean
      }
    | {
          type: MessageEvents.updateCSSPath
          payload: CSSPath[]
      }
    | {
          type: MessageEvents.applyActions
          payload: {
              value: string
              uniqueSelector: string
              node: NodeLink | NodeInput | BaseNode
              kind:
                  | ScrapperActions.INPUT_VALUE
                  | ScrapperActions.INPUT_VALUE_AND_ENTER
                  | ScrapperActions.CLICK_AND_CONTINUE
          }
      }
    | {
          type: MessageEvents.unsavedChanges
          payload: boolean
      }

export type Response =
    | {
          type: ResponseEvents.addCSSPath
          payload: {
              url: string
          } & CSSPathPassed
      }
    | {
          type: ResponseEvents.initSuccess
      }
    | {
          type: ResponseEvents.pageLoaded
          payload: {
              url: string
          }
      }
