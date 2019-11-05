import React, { Component } from 'react'
import parseTsv from 'libe-utils/parse-tsv'
import Svg from 'libe-components/lib/primitives/Svg'
import JSXInterpreter from 'libe-components/lib/logic/JSXInterpreter'
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
      active_story: null,
      body_padding_top: 0
    }
    this.fetchSheet = this.fetchSheet.bind(this)
    this.fetchCredentials = this.fetchCredentials.bind(this)
    this.handleStoryScroll = this.handleStoryScroll.bind(this)
    this.activateHome = this.activateHome.bind(this)
    this.handleHeaderHeightChange = this.handleHeaderHeightChange.bind(this)
    this.activatePrevStory = this.activatePrevStory.bind(this)
    this.activateNextStory = this.activateNextStory.bind(this)
    this.getActiveStory = this.getActiveStory.bind(this)
    this.getPreviousStory = this.getPreviousStory.bind(this)
    this.getNextStory = this.getNextStory.bind(this)
    window.addEventListener('lblb-client-dimensions-change', this.handleHeaderHeightChange)
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
      if (!window.LBLB_GLOBAL) window.LBLB_GLOBAL = {}
      window.LBLB_GLOBAL.lblb_tracking = lblb_tracking
      window.LBLB_GLOBAL.lblb_posting = lblb_posting
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
      const [page, authors, stories, blocks] = parseTsv(data, [7, 3, 4, 5])
      this.setState({ loading_sheet: false, error_sheet: null, data_sheet: {
        page: page[0],
        authors,
        stories,
        blocks
      }})
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
    if (window.LBLB_GLOBAL.current_display === 'lg') this.$storyContent.scrollLeft += e.deltaY
  }

  /* * * * * * * * * * * * * * * * *
   *
   * HANDLE HEADER HEIGHT CHANGE
   *
   * * * * * * * * * * * * * * * * */
  handleHeaderHeightChange (e) {
    return this.setState({ body_padding_top: window.LBLB_GLOBAL.body_padding_top })
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
  activateStory (id) {
    this.$storyContent.scrollLeft = 0
    this.setState({ active_story: id })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ACTIVATE PREV STORY
   *
   * * * * * * * * * * * * * * * * */
  activatePrevStory () {
    const prevStory = this.getPreviousStory()
    if (!prevStory.id) return this.activateHome()
    return this.activateStory(prevStory.id)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ACTIVATE NEXT STORY
   *
   * * * * * * * * * * * * * * * * */
  activateNextStory () {
    const nextStory = this.getNextStory()
    if (!nextStory.id) return this.activateHome()
    return this.activateStory(nextStory.id)
  }

  /* * * * * * * * * * * * * * * * *
   *
   * GET ACTIVE STORY
   *
   * * * * * * * * * * * * * * * * */
  getActiveStory () {
    const { stories, blocks } = this.state.data_sheet
    const { active_story: activeStory } = this.state
    if (!stories || !blocks || !activeStory) return {}
    const found = stories.find(story => story.id === activeStory)
    if (!found) return {}
    const storyBlocks = blocks.filter(block => block.story_id === found.id)
    return {
      ...found,
      _blocks: storyBlocks
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * GET PREVIOUS STORY
   *
   * * * * * * * * * * * * * * * * */
  getPreviousStory () {
    const { stories, blocks } = this.state.data_sheet
    const active = this.getActiveStory()
    if (!stories || !blocks || !active.id) return {}
    const activePos = stories.findIndex(story => story.id === active.id)
    const prevPos = (stories.length + activePos - 1) % stories.length
    const found = stories[prevPos]
    if (!found) return {}
    const storyBlocks = blocks.filter(block => block.story_id === found.id)
    return {
      ...found,
      _blocks: storyBlocks
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * GET NEXT STORY
   *
   * * * * * * * * * * * * * * * * */
  getNextStory () {
    const { stories, blocks } = this.state.data_sheet
    const active = this.getActiveStory()
    if (!stories || !blocks || !active.id) return {}
    const activePos = stories.findIndex(story => story.id === active.id)
    const nextPos = (activePos + 1) % stories.length
    const found = stories[nextPos]
    if (!found) return {}
    const storyBlocks = blocks.filter(block => block.story_id === found.id)
    return {
      ...found,
      _blocks: storyBlocks
    }
  }

  /* * * * * * * * * * * * * * * * *
   *
   * RENDER
   *
   * * * * * * * * * * * * * * * * */
  render () {
    const { c, state, props } = this
    const { data_sheet: data } = state
    const previousStory = this.getPreviousStory()
    const activeStory = this.getActiveStory()
    const nextStory = this.getNextStory()

    console.log(activeStory, previousStory, nextStory)

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)
    if (state.active_story !== null) classes.push(`${c}_in-story`)

    /* Load & errors */
    if (state.loading_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-loader'><Loader /></div></div>
    if (state.error_sheet) return <div className={classes.join(' ')}><div className='lblb-default-apps-error'><LoadingError /></div></div>

    /* Inner logic */
    const contentHeight = window.LBLB_GLOBAL.client_height - state.body_padding_top
    const contentStyle = {
      height: window.LBLB_GLOBAL.current_display === 'lg'
        ? contentHeight
        : null
    }

    /* Display component */
    return <div className={classes.join(' ')}>

      {/* HOME - desktop */}
      <div className={`${c}__home-wrapper ${c}__home-wrapper_desktop`}
        style={contentStyle}>
        <div className={`${c}__desktop-doors`}>{
          data.stories.map(story => <div key={story.id}
            className={`${c}__desktop-door`}
            onClick={e => this.activateStory(story.id)}>
            <BlockTitle>{story.title}</BlockTitle>
          </div>)
        }</div>
        <div className={`${c}__desktop-title-and-intro`}>
          <PageTitle small>{data.page.title}</PageTitle>
          <Paragraph><JSXInterpreter content={data.page.intro} /></Paragraph>
          <ArticleMeta inline authors={data.authors} />
          <ShareArticle short iconsOnly tweet={data.page.tweet} />
        </div>
      </div>

      {/* HOME - mobile */}
      <div className={`${c}__home-wrapper ${c}__home-wrapper_mobile`}>
        <div className={`${c}__mobile-cover-image`}>
          <div className={`${c}__mobile-title`}>
            <PageTitle small>{data.page.title}</PageTitle>
          </div>
        </div>
        <div className={`${c}__mobile-intro`}>
          <Paragraph><JSXInterpreter content={data.page.intro} /></Paragraph>
          <ArticleMeta inline authors={data.authors} />
          <ShareArticle short iconsOnly tweet={data.page.tweet} />
        </div>
        <div className={`${c}__mobile-doors`}>{
          data.stories.map(story => <div key={story.id}
            className={`${c}__mobile-door`}
            onClick={e => this.activateStory(story.id)}>
            <div className={`${c}__mobile-door-preview`}>
              <BlockTitle>{story.title}</BlockTitle>
              <Paragraph><JSXInterpreter content={story.text_preview} /></Paragraph>
            </div>
            <div className={`${c}__mobile-door-shadow`} />
          </div>)
        }</div>
        <div className='lblb-default-apps-footer'>
          <ShareArticle short iconsOnly tweet={data.page.tweet} />
          <ArticleMeta authors={data.authors} />
          <LibeLaboLogo target='blank' />
        </div>
      </div>

      {/* STORY */}
      <div className={`${c}__story-wrapper`} style={contentStyle}>
        <div className={`${c}__story`}>
          <div className={`${c}__story-cover`}>
            <div className={`${c}__story-title`}><BlockTitle>{activeStory.title}</BlockTitle></div>
            <div className={`${c}__story-desktop-controls`}>
              <button className={`${c}__story-go-prev`} onClick={this.activatePrevStory}>
                <Svg src={`${props.statics_url}/assets/left-arrow-head-icon_24.svg`} />
                <BlockTitle small>{previousStory.title}</BlockTitle>
              </button>
              <button className={`${c}__story-go-home`} onClick={this.activateHome}>
                <BlockTitle small>Menu</BlockTitle>
              </button>
              <button className={`${c}__story-go-next`} onClick={this.activateNextStory}>
                <BlockTitle small>{nextStory.title}</BlockTitle>
                <Svg src={`${props.statics_url}/assets/right-arrow-head-icon_24.svg`} />
              </button>
            </div>
          </div>
          <div className={`${c}__story-content`}
            ref={n => this.$storyContent = n}
            onWheel={this.handleStoryScroll}>{
              Array.isArray(activeStory._blocks)
                ? activeStory._blocks.map((block, i) => <div className={`${c}__story-${block.type}-slot`}>
                  {block.type}
                </div>)
                : ''
            }<div style={{ opacity: 0 }}>.</div>
          </div>
          <div className={`${c}__story-mobile-controls`}>
            <button className={`${c}__story-go-prev`} onClick={this.activatePrevStory}>PREV</button>
            <button className={`${c}__story-go-home`} onClick={this.activateHome}>MENU</button>
            <button className={`${c}__story-go-next`} onClick={this.activateNextStory}>NEXT</button>
          </div>
        </div>
      </div>
    </div>
  }
}
