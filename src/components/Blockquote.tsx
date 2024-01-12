type Props = {
  content: string
}


// render a highlight box when blockquotes are used in markdown
function Blockquote(props: Props) {
    const { content } = props;
    return (
      <div className='color-bg-attention color-border-attention border rounded p-3' style={{width: 'fit-content'}}>
        {/* <ZapIcon/> */}
        {content}
      </div>
    );
}

export default Blockquote
