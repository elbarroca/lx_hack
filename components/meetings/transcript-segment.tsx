interface TranscriptSegmentProps {
    speaker: string
    text: string
    timestamp: string
    isHighlighted: boolean
    searchTerm: string
  }
  
  export default function TranscriptSegment({
    speaker,
    text,
    timestamp,
    isHighlighted,
    searchTerm,
  }: TranscriptSegmentProps) {
    const highlightText = (text: string, searchTerm: string) => {
      if (!searchTerm) return text
  
      const regex = new RegExp(`(${searchTerm})`, "gi")
      const parts = text.split(regex)
  
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-green-500/30 text-green-300">
            {part}
          </mark>
        ) : (
          part
        ),
      )
    }
  
    return (
      <div
        className={`p-3 rounded-lg border transition-all ${
          isHighlighted ? "bg-gray-800 border-gray-700" : "bg-gray-800/50 border-gray-700/50 opacity-50 hover:opacity-75"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-sm">
              {speaker.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{speaker}</span>
              <span className="text-xs text-gray-400">{timestamp}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{highlightText(text, searchTerm)}</p>
          </div>
        </div>
      </div>
    )
  }
  