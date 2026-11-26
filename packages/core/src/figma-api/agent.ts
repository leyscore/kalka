// What an agent shows and asks the person through the hosts that run it.

/** A section an agent says it will build: what it is called and roughly how tall it will be. */
export interface PlannedSection {
  name: string
  /** In pixels; an estimate until the section exists. */
  height: number
}

/** A question an agent asks the person, with answers they can pick in one click. */
export interface AgentQuestion {
  question: string
  /** Suggested answers, shown as buttons; the person can always type their own. */
  options?: string[]
  /** Whether several options can be picked together. */
  multiple?: boolean
  /** A hint for the typed answer. */
  placeholder?: string
  /**
   * Pictures the person picks from, such as visual references; a question with pictures also
   * lets them send a picture of their own.
   */
  images?: AgentQuestionImage[]
}

/** A picture offered as an answer: its HTTPS address, what it shows, and where it comes from. */
export interface AgentQuestionImage {
  url: string
  label: string
  /** The page the picture comes from. */
  link?: string
  /** Who made it and under which licence. */
  credit?: string
}

/** A picture the person sent with an answer, as Base64 bytes. */
export interface AgentAnswerImage {
  name: string
  mimeType: string
  base64: string
}

/** The person's answer to one question: the options they picked and what they typed. */
export interface AgentAnswer {
  question: string
  answer: string
  /** A picture of their own, when the question offered pictures. */
  image?: AgentAnswerImage
  /** The offered pictures the person picked, as bytes, for those the host could download. */
  references?: AgentAnswerImage[]
}
