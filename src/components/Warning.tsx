import { ZapIcon } from '@primer/octicons-react'

type Props = {
  content: string
}


// render a warning message with an exclamation triangle icon when blockquotes are used in markdown
function Warning(props: Props) {
    const { content } = props;
    return (
      <div>
        <ZapIcon/>
        {content}
      </div>
    );
}

export default Warning
