import React, { Component } from 'react'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import PageTitle from 'libe-components/lib/text-levels/PageTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'

export default class App extends Component {
  /* * * * * * * * * * * * * * * * *
   *
   * CONSTRUCTOR
   *
   * * * * * * * * * * * * * * * * */
  constructor () {
    super()
    this.c = 'lblb-horizontal-parallel-stories'
    this.state = {
      loading_sheet: true,
      error_sheet: null,
      data_sheet: [],
      active_story: 1
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.handleStoryScroll = this.handleStoryScroll.bind(this)
    this.activateHome = this.activateHome.bind(this)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * DID MOUNT
   *
   * * * * * * * * * * * * * * * * */
  componentDidMount () {
    this.fetchCredentials()
    if (this.props.spreadsheet) return this.fetchSheet()
    return this.setState({ loading_sheet: false })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH CREDENTIALS
   *
   * * * * * * * * * * * * * * * * */
  async fetchCredentials () {
    const { api_url } = this.props
    const { format, article } = this.props.tracking
    const api = `${api_url}/${format}/${article}/load`
    try {
      const reach = await window.fetch(api, { method: 'POST' })
      const response = await reach.json()
      const { lblb_tracking, lblb_posting } = response._credentials
      window.lblb_tracking = lblb_tracking
      window.lblb_posting = lblb_posting
      return { lblb_tracking, lblb_posting }
    } catch (error) {
      console.error(`Unable to fetch credentials:`)
      console.error(error)
      return Error(error)
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * FETCH SHEET
   *
   * * * * * * * * * * * * * * * * */
  async fetchSheet () {
    this.setState({ loading_sheet: true, error_sheet: null })
    const sheet = this.props.spreadsheet
    try {
      const reach = await window.fetch(this.props.spreadsheet)
      if (!reach.ok) throw reach
      const data = await reach.text()
      const parsedData = data // Parse sheet here
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: parsedData })
      return data
    } catch (error) {
      if (error.status) {
        const text = `${error.status} error while fetching : ${sheet}`
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(text, error)
        return Error(text)
      } else {
        this.setState({ loading_sheet: false, error_sheet: error })
        console.error(error)
        return Error(error)
      }
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE STORY SCROLL
   *
   * * * * * * * * * * * * * * * * */
  handleStoryScroll (e) {
    if (window.innerWidth > 1008) this.$storyContent.scrollLeft += e.deltaY
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ACTIVATE HOME
   *
   * * * * * * * * * * * * * * * * */
  activateHome () {
    this.$storyContent.scrollLeft = 0
    this.setState({ active_story: null })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ACTIVATE STORY
   *
   * * * * * * * * * * * * * * * * */
  activateStory (i) {
    this.$storyContent.scrollLeft = 0
    this.setState({ active_story: i })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)
    if (state.active_story !== null) classes.push(`${c}_in-story`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Display component */
    return <div className={classes.join(' ')}>

      {/* HOME - desktop */}
      <div className={`${c}__home-wrapper ${c}__home-wrapper_desktop`}>
        <div className={`${c}__desktop-doors`}>{
          new Array(7).fill(null).map((e, i) => <div key={i}
            className={`${c}__desktop-door`}
            onClick={e => this.activateStory(i)}>
            <BlockTitle>Perso {i + 1}</BlockTitle>
          </div>)
        }</div>
        <div className={`${c}__desktop-title-and-intro`}>
          <PageTitle small>Titre du format</PageTitle>
          <Paragraph>
            Nam at urna nec dui commodo consequat ut at nunc. Aenean scelerisque mi non pharetra convallis.<br /><br />
            Vivamus ultrices arcu ac mauris porttitor venenatis at ac erat. Nam pretium nibh at leo faucibus efficitur. Sed fermentum tortor eget volutpat porta. Curabitur tempus nulla eu porttitor ullamcorper.
          </Paragraph>
          <ArticleMeta inline authors={[
          { name: 'Doudou' },
          { name: 'Libé Labo', role: 'Production' },
          { name: 'Jean-Michel', role: 'Photo' }]} />
          <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
        </div>
      </div>

      {/* HOME - mobile */}
      <div className={`${c}__home-wrapper ${c}__home-wrapper_mobile`}>
        <div className={`${c}__mobile-cover-image`}>
          <div className={`${c}__mobile-title`}>
            <PageTitle small>Titre du format</PageTitle>
          </div>
        </div>
        <div className={`${c}__mobile-intro`}>
          <Paragraph>
            Nam at urna nec dui commodo consequat ut at nunc. Aenean scelerisque mi non pharetra convallis.<br /><br />
            Vivamus ultrices arcu ac mauris porttitor venenatis at ac erat. Nam pretium nibh at leo faucibus efficitur. Sed fermentum tortor eget volutpat porta. Curabitur tempus nulla eu porttitor ullamcorper.
          </Paragraph>
          <ArticleMeta inline authors={[
            { name: 'Doudou' },
            { name: 'Libé Labo', role: 'Production' },
            { name: 'Jean-Michel', role: 'Photo' }]} />
          <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
        </div>
        <div className={`${c}__mobile-doors`}>{
          new Array(7).fill(null).map((e, i) => <div key={i}
            className={`${c}__mobile-door`}
            onClick={e => this.activateStory(i)}>
            <div className={`${c}__mobile-door-preview`}>
              <BlockTitle>Perso {i + 1}</BlockTitle>
              <Paragraph>Vivamus ultrices arcu ac mauris porttitor venenatis at ac erat. Nam pretium nibh at leo faucibus efficitur. Sed fermentum tortor eget volutpat porta. Curabitur tempus nulla eu porttitor ullamcorper.</Paragraph>
            </div>
            <div className={`${c}__mobile-door-shadow`} />
          </div>)
        }</div>
        <div className='lblb-default-apps-footer'>
          <ShareArticle short iconsOnly tweet={props.meta.tweet} url={props.meta.url} />
          <ArticleMeta authors={[
            { name: 'Doudou' },
            { name: 'Libé Labo', role: 'Production' },
            { name: 'Jean-Michel', role: 'Photo' }]} />
          <LibeLaboLogo target='blank' />
        </div>
      </div>

      {/* STORY */}
      <div className={`${c}__story-wrapper`} onClick={this.activateHome}>
        <div className={`${c}__story`}>
          <div className={`${c}__story-cover`}>
            <div className={`${c}__story-title`}><BlockTitle>Story name</BlockTitle></div>
            <div className={`${c}__story-desktop-controls`}>CONTROLS</div>
          </div>
          <div className={`${c}__story-content`}
            ref={n => this.$storyContent = n}
            onWheel={this.handleStoryScroll}>
            <div className={`${c}__story-images-slot`}>Images</div>
            <div className={`${c}__story-text-slot`}>Text</div>
            <div className={`${c}__story-images-slot`}>Images</div>
            <div className={`${c}__story-text-slot`}>Text</div>
            <div className={`${c}__story-images-slot`}>Images</div>
            <div className={`${c}__story-text-slot`}>Text</div>
            <div className={`${c}__story-images-slot`}>Images</div>
            <div className={`${c}__story-text-slot`}>Text</div>
            <div style={{ opacity: 0 }}>.</div>
          </div>
          <div className={`${c}__story-mobile-controls`}>CONTROLS</div>
        </div>
      </div>
    </div>
  }
}
