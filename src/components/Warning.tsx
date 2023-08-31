import styled from '@emotion/styled';
import { ZapIcon } from '@primer/octicons-react'

const WarningDiv = styled.div`
  border: 1px solid black;
  border-radius: 4px;
  display: flex;
  padding: 10px;

  p {
    padding: 0 10px;
    margin: 0;
  }
`

type Props = {
  content: string
}


// render a warning message with an exclamation triangle icon when blockquotes are used in markdown
function Warning(props: Props) {
    const { content } = props;
    return (
      <WarningDiv>
        <ZapIcon/>
        {content}
      </WarningDiv>
    );
}

export default Warning
