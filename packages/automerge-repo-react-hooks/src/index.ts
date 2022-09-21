import { Doc } from "automerge-js"
import { DocHandle, DocHandleEventArg, DocCollection } from "automerge-repo"
import { useEffect, useState, createContext, useContext } from "react"

export const RepoContext = createContext<DocCollection | null>(null)

export function useRepo(): DocCollection {
  const repo = useContext(RepoContext)

  if (!repo) {
    throw new Error("Repo not available on RepoContext.")
  }

  return repo
}

export function useDocument<T>(
  documentId: string
): [doc: Doc<T> | undefined, changeFn: (cf: (d: T) => void) => void] {
  const [doc, setDoc] = useState<Doc<T>>() // should be Doc<T> but that's an error?
  const repo = useRepo()
  const handle = repo.find<T>(documentId)

  useEffect(() => {
    if (!handle) {
      return
    }
    handle.value().then((v) => setDoc(v as Doc<T>))
    const listener = (h: DocHandleEventArg<T>) => setDoc(h.doc as Doc<T>)
    handle.on("change", listener)

    return () => {
      handle.removeListener("change", listener)
    }
  }, [handle])

  const changeDoc = (changeFunction: (d: T) => void) => {
    if (!handle) {
      return
    }
    handle.change(changeFunction)
  }

  return [doc, changeDoc]
}
