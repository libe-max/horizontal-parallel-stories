import React, { Component } from 'react'
import parseTsv from 'libe-utils/parse-tsv'
import Svg from 'libe-components/lib/primitives/Svg'
import JSXInterpreter from 'libe-components/lib/logic/JSXInterpreter'
import Loader from 'libe-components/lib/blocks/Loader'
import LoadingError from 'libe-components/lib/blocks/LoadingError'
import ArticleMeta from 'libe-components/lib/blocks/ArticleMeta'
import ShareArticle from 'libe-components/lib/blocks/ShareArticle'
import LibeLaboLogo from 'libe-components/lib/blocks/LibeLaboLogo'
import Photo from 'libe-components/lib/blocks/Photo'
import SectionTitle from 'libe-components/lib/text-levels/SectionTitle'
import Paragraph from 'libe-components/lib/text-levels/Paragraph'
import BlockTitle from 'libe-components/lib/text-levels/BlockTitle'
import Quote from 'libe-components/lib/text-levels/Quote'

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
      body_padding_top: 0,
      show_story_scroll_hint: true
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
      const [page, authors, stories, blocks] = parseTsv(data, [9, 3, 6, 5])
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
    if (window.LBLB_GLOBAL.current_display !== 'lg') return
    const scrolled = e
      ? e.nativeEvent.wheelDelta
        ? e.nativeEvent.deltaY
        : e.nativeEvent.deltaY * 40
      : 0
    this.$storyContent.scrollLeft += scrolled
    if (this.state.show_story_scroll_hint && this.$storyContent.scrollLeft >= 40) return this.setState({ show_story_scroll_hint: false })
    return
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
    window.scrollTo(0, 0)
    this.$storyContent.scrollLeft = 0
    this.setState({ active_story: null })
  }

  /* * * * * * * * * * * * * * * * *
   *
   * ACTIVATE STORY
   *
   * * * * * * * * * * * * * * * * */
  activateStory (id) {
    window.scrollTo(0, 0)
    this.$storyContent.scrollLeft = 0
    this.setState({ active_story: id }, this.handleStoryScroll)
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

    /* Assign classes */
    const classes = [c]
    if (state.loading_sheet) classes.push(`${c}_loading`)
    if (state.error_sheet) classes.push(`${c}_error`)
    if (state.active_story !== null) classes.push(`${c}_in-story`)
    if (state.show_story_scroll_hint) classes.push(`${c}_show-story-scroll-hint`)

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
          data.stories.map((story, i) => <div key={story.id}
            className={`${c}__desktop-door`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(33, 33, 33, .5) 0%, rgba(33, 33, 33, 0) 25%), url(${story.home_cover_img_url})`,
              width: `${100 / data.stories.length}%`
            }}
            onClick={e => this.activateStory(story.id)}>
            <BlockTitle big>{story.title}</BlockTitle>
          </div>)
        }</div>
        <div className={`${c}__desktop-title-and-intro`}>
          <SectionTitle level={1}><JSXInterpreter content={data.page.title_desktop} /></SectionTitle>
          <Paragraph><JSXInterpreter content={data.page.intro} /></Paragraph>
          <ArticleMeta inline authors={data.authors} />
          <ShareArticle short iconsOnly tweet={data.page.tweet} />
        </div>
      </div>

      {/* HOME - mobile */}
      <div className={`${c}__home-wrapper ${c}__home-wrapper_mobile`}>
        <div className={`${c}__mobile-cover-image`}
          style={{ backgroundImage: `url(${data.page.gif_url})` }}>
          <div className={`${c}__mobile-title`}>
            <SectionTitle big level={1}><JSXInterpreter content={data.page.title_mobile} /></SectionTitle>
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
            style={{ backgroundImage: `url(${story.home_cover_img_url})` }}
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
          <div className={`${c}__story-cover`}
            style={{ backgroundImage: `url(${activeStory.cover_img_url})` }}>
            <div className={`${c}__story-title`}><BlockTitle huge>{activeStory.title}</BlockTitle></div>
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
              ? activeStory._blocks.map((block, i) => {
                if (block.type === 'text') {
                  return <div key={i} className={`${c}__story-text-slot`}>
                    <Paragraph><JSXInterpreter content={block.content} /></Paragraph>
                  </div>

                } else if (block.type === 'text-quote') {
                  return <div key={i} className={`${c}__story-text-slot ${c}__story-text-slot_quote`}>
                    <Quote literary big decoration><JSXInterpreter content={block.content} /></Quote>
                  </div>                  

                } else if (block.type === 'image') {
                  const images = block.thumb_images_url.split(',').map(url => url.trim())
                  let className = `${c}__story-image-slot`
                  if (images.length === 1) className += ` ${c}__story-image-slot_single`
                  return <div key={i} className={className}>{
                    images.map((url, i) => {
                      return <Photo key={url} expandable src={url} />
                    })
                  }</div>

                } else if (block.type === 'image-vertical') {
                  const images = block.thumb_images_url.split(',').map(url => url.trim())
                  let className = `${c}__story-image-slot ${c}__story-image-slot_vertical`
                  if (images.length === 1) className += ` ${c}__story-image-slot_single`
                  const pairs = [[]]
                  images.forEach(image => {
                    if (pairs[pairs.length - 1].length >= 2) pairs.push([])
                    pairs[pairs.length - 1].push(image)
                  })
                  return <div key={i} className={className}>{
                    pairs.map((pair, i) => {
                      return <div key={pair.join('')} className={`${c}__story-image-slot-lame-flex-fix`}>{
                        pair.map((url, i) => {
                          return <Photo key={url} expandable src={url} />
                        })
                      }</div>
                    })
                  }</div>
                } else return ''
              })
              : ''
            }
            <div className={`${c}__story-text-slot ${c}__story-text-slot_authors`}>
              <ArticleMeta authors={[{ name: activeStory.authors }, { name: 'Libé Labo', role: 'Production' }]} />
            </div>
            <div>&nbsp;</div>
            <div className={`${c}__story-scroll-hint`}
              onMouseOver={e => this.setState({ show_story_scroll_hint: false })}>
              <Paragraph>Faites défiler</Paragraph>
              <Svg src={`${props.statics_url}/assets/right-arrow-head-icon_24.svg`} />
            </div>
          </div>
          <div className={`${c}__story-mobile-controls`}>
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
      </div>
    </div>
  }
}
