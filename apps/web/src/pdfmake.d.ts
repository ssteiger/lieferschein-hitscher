declare module 'pdfmake/build/pdfmake' {
  const pdfMake: {
    createPdf: (docDefinition: Record<string, unknown>) => {
      download: (filename?: string) => void
      open: () => void
      print: () => void
    }
    addVirtualFileSystem: (vfs: unknown) => void
  }
  export default pdfMake
}

declare module 'pdfmake/build/vfs_fonts' {}
