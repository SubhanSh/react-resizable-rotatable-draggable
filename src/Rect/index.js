import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { getLength, getAngle, getCursor } from '../utils'
import StyledRect from './StyledRect'

const zoomableMap = {
  'n': 't',
  's': 'b',
  'e': 'r',
  'w': 'l',
  'ne': 'tr',
  'nw': 'tl',
  'se': 'br',
  'sw': 'bl'
}

export default class Rect extends PureComponent {
  static propTypes = {
    styles: PropTypes.object,
    zoomable: PropTypes.string,
    rotatable: PropTypes.bool,
    onResizeStart: PropTypes.func,
    onResize: PropTypes.func,
    onResizeEnd: PropTypes.func,
    onRotateStart: PropTypes.func,
    onRotate: PropTypes.func,
    onRotateEnd: PropTypes.func,
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func,
    onRemove: PropTypes.func,
    parentRotateAngle: PropTypes.number
  }

  setElementRef = (ref) => { this.$element = ref }

  // Drag
  startDrag = (e) => {
    let { clientX: startX, clientY: startY } = e
    this.props.onDragStart && this.props.onDragStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      this.props.onDrag(deltaX, deltaY)
      startX = clientX
      startY = clientY
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onDragEnd && this.props.onDragEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Rotate
  startRotate = (e) => {
    if (e.button !== 0) return
    const { clientX, clientY } = e
    const { styles: { transform: { rotateAngle: startAngle } } } = this.props
    const rect = this.$element.getBoundingClientRect()
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
    const startVector = {
      x: clientX - center.x,
      y: clientY - center.y
    }
    this.props.onRotateStart && this.props.onRotateStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const rotateVector = {
        x: clientX - center.x,
        y: clientY - center.y
      }
      const angle = getAngle(startVector, rotateVector)
      this.props.onRotate(angle, startAngle)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onRotateEnd && this.props.onRotateEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Resize
  startResize = (e, cursor) => {
    if (e.button !== 0) return
    document.body.style.cursor = cursor
    const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } } } = this.props
    const { clientX: startX, clientY: startY } = e
    const rect = { width, height, centerX, centerY, rotateAngle }
    const type = e.target.getAttribute('class').split(' ')[ 0 ]
    this.props.onResizeStart && this.props.onResizeStart()
    this._isMouseDown = true
    const onMove = (e) => {
      if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
      e.stopImmediatePropagation()
      const { clientX, clientY } = e
      const deltaX = clientX - startX
      const deltaY = clientY - startY
      const alpha = Math.atan2(deltaY, deltaX)
      const deltaL = getLength(deltaX, deltaY)
      const isShiftKey = e.shiftKey
      this.props.onResize(deltaL, alpha, rect, type, isShiftKey)
    }

    const onUp = () => {
      document.body.style.cursor = 'auto'
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      if (!this._isMouseDown) return
      this._isMouseDown = false
      this.props.onResizeEnd && this.props.onResizeEnd()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  handleRemove = () => {
    this.props.onRemove && this.props.onRemove()
  }

  getHandlerAttrs = (d, cursor) => {
    if (['nw', 'se'].includes(d)) {
      return {
        onMouseDown: (e) => this.startResize(e, cursor)
      }
    } else if (d === 'sw') {
      return {
        onClick: () => this.handleRemove()
      }
    } else if (d === 'ne') {
      return {
        onMouseDown: this.startRotate
      }
    }
  }

  getCornerIcon = (d) => {
    if (d === 'ne') {
      return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path d="M10.536 3.464A5 5 0 1 0 11 10l1.424 1.425a7 7 0 1 1-.475-9.374L13.659.34A.2.2 0 0 1 14 .483V5.5a.5.5 0 0 1-.5.5H8.483a.2.2 0 0 1-.142-.341l2.195-2.195z" fill="#ffffff" fillRule="nonzero" /></svg>
    }
    if (d === 'nw') {
      return <img width="14" height="14" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAAXNSR0IB2cksfwAAAX1QTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8P1QGgAAAH90Uk5TAAyY8P/eYwEFtPx6QvuCAoF3CHP6H+4Abv2DffcDfFwORpy/1df24xIJgOFmOdO2R9Iy3wTIZHDO5uIUI7g6C3ZtxXWKh1FdlKcmHuyq9SBoRYwHxhCo7eRxGTM0ESI7/mm5u0HWurKtSy/pTrw1zwoa4CnaJzZqwx2Q3fLET2NxJHYAAAHLSURBVHic7dZnV8IwFAbgqFG02CIKaoE6cSBOnAUV9xYn7q24J+Iev91KV9qSNn73/cS5ycPNODkAgHWysnNgbp6NYKac/AIohLL/wRTSMG0YBzEpgmJoZzEpKZEIdBH3cZfKBjKEfcrKWZlQHtI+Xp9saIbw3LgKtU+lcbiquqbWr09dvbKdhkYdCDQFlS/EpFkrWlot5gtp04j2oLWAHagIdRII6EdEVzeJ0Cysh0jAXqRJn1yk+E5dwi5F8BGV9MtXPDDYGNVlSCXDyLrypNpI1HC9o8pNusbQ+rhUnTCISfXupwLowLRYpGf0YnZOEWMaAebFamxBTxaVVWl7mBAPpocJWaLEo182bBJLVlbTA8td5ATE19Z9G5uGshkB3Fa//mFZEVz+CTGJb+/sakn+3v4eZyImg+xB+BAlkaMYrD+OY8VJ7Hci6+UUEkqkP5xifxjOxJm+inOJXCSk13GJI37pMbC89Cqv5OdxjSM3EBP2FkcuaAy5u8cRm53KKPgHnBAMk6lP8hEvAHA4XQaRejITABQzhh7P5kLow2j3k8IeFtLHg+4neVtmTTR9UparEmN7kf52sK9vZEKI+/2Dgp9f3ytWE38AHWhRWbBOU84AAAAASUVORK5CYII=" />
    }

    if (d === 'se') {
      return <img width="14" height="14" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAAXNSR0IB2cksfwAAAXpQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////02MLIAAAAH50Uk5TAAdPxPL//N2QHx3D/e5qATbaggI14PuDCCf6dyka5noKz0u8TunVL9b1rXz3sroyIKoDfUEQu/a5FGni/uFdIjsFETQzEiMZceTtqASMxkUJipRo7B4mp1GHdQvFY212OrjfznBktsjSR9M5ZoDj17+cRg5cbnOBQrTe8JgMkgfveQAAAcpJREFUeJzt1ldbwjAUBuA4UlcVKApYFJwoigsHoqKi4gTFvffee+t/F9smLS2B473fDX168nKSlPQBoQzJys7JxVxefkGmgTSFRTyWUlxiggmzBZNwghUiSsuwGpvdARAWrA2gj7kM6yJk6FNu0QssOtP2qTD0+F2PkGbfKl0pRGI9bqapqk4pEn1qWKSUZxBcyyJ1ZES9Tf50ke/wsEiDKA9orPHKF03NPvmihUUcrbJoa1dIh79T6uPtYhHU3RPA3t4gogShvv4BPjTIFAj5h4aHwkhL0MjoWHcaQaIlwPwTNomMT/j/RianfNMzxifFJtGYVJjNgpMYJxW4OSiJz5PjYQeS+IJIyCKMqD3w0rKerCincjW5BxUB42lYU0rr2pvzdFaBDYPY3FJq25qbO7SHuLupS2RvX6n5xlURVF9xYv+BLi6O1A6jKjnCoBxr5nUCEqeaJsgDEQdt2i05A4jQedIuAiZ2cZm88VcZxvOh67juWUVuaDVw69Hn7v7h0fB40RPde745xalMFZNgI8bXCSPIalf7PAONQ6DLKYb+VbEK9Mf8AiTI4STreYWSRB95PbY3MEEmt2Tew3CCTNsf+PPrGzDyB2U0UT/tZGYTAAAAAElFTkSuQmCC" />
    }

    if (d === 'sw') {
      return <img width="14" height="14" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcIAAAIAAQMAAAArHv4kAAAAAXNSR0IB2cksfwAAAAZQTFRFAAAA////pdmf3QAAAAJ0Uk5TAP9bkSK1AAADgklEQVR4nO3dTZaqMBAFYDwMHLIElpKlJUtjKSyBoQOP9NP+ISSFuVXSh/j61kwPn0pVRUCINI0Yfl4iyIvIcY7gfNFIF8tZI1dwHnDYruWEy24tr7hcr6ZmRX0iAwpPCZxHVLaphFN0TiXcC10q4eT2qbyhMi0KXpa0KHhZMoh2blZOuKBZOeGCZuWEC2qXWSPArdDvKcEmcrkEm8guvSBDtVKAYMub5edQGTceFmXUNJ1ORsOqhWWbrlfySgUZoie8SsZPOFTeB/ZqbPQzOLTPczIeu9+X2YLZS9Uk+7QIbZrsmqRLG/yUNlVN0mdfHuhX2BEyXy5/rWqkUIOsTvVIob+zMXCs7KUN33YsLyzsIj6P8VsKu2vP4+cLzmnlT9XU8LsXhf3ZUkzG1fxZ0V4vb9YEfafIAD9TpO6De4zG1H4l15Dar+QKO/zluBqL8lUWZ5GPsniTDC9JE7y3gqkRHq1gl6YWejSRqYUeTWSXpuZ7tJ9d9jZ5O0Y6m5xfkd4ow5tJI/w3tCkpKSkpKSkpKSl/Rx6xZ2w+dnjpSMd+RGc8/pxeOc42pig8floa5F8eGQwGg8FgPAtv2uy+n3RK2VBSViB7HbxRUtYglcegdple5PiyHJYHUxstXJbRKePoZ4opHv2yvEanxqMviyHOvywvyzYx/skgxEfyspyWN4pPAq/Oe8tyXN4oOmV9e0WeSnJYHk3LG92X/T0Zlo84Lh/xfqmHl+RZJy//gWyWhA5LQu+X0TjKd5GtTqaXhlNSHiJPOjlSUtYgG50cKCmrkF4lAyVlFdKpZENJWYXsNTKbykpJeYzsNDKbDk1JeYw8a2Q2MZ6S8hjZamT2FwmUlMfIk0aOlJTvLhuNHCgpK5FeIQMlZSXSKWRDSVmJ7HEp/B0XJeUxssPllZKyFnnG5YWSshbZ4nKi/BMyFK/mr0CecDnuLofijJD95Vic+bK/nFabO2mGz5YszyrakpszmbqSLM+e2pTFGVubshiJbMpiWQdKylqkh2WgpBSlg2XzR2WPwuy+FEdIeLp0ds+PIyT812TZ/VTssi2bz5j2k/DOybifhDcsQyY9KMOO0oEyg+hgEW4bAzaucHscuwQbV7iBENh+WfPBTTTmEmyiQZAOkgLECireBQgqi3i3Iyi5QmrBFEmpxUZLEGVfhhu3SQJWVF5N5OPKHxZo+lW7fwBM/1UcrFGzJgAAAABJRU5ErkJggg==" />
    }
  }

  render () {
    const {
      styles: {
        position: { centerX, centerY },
        size: { width, height },
        transform: { rotateAngle }
      },
      zoomable,
      rotatable,
      parentRotateAngle
    } = this.props
    const style = {
      width: Math.abs(width),
      height: Math.abs(height),
      transform: `rotate(${rotateAngle}deg)`,
      left: centerX - Math.abs(width) / 2,
      top: centerY - Math.abs(height) / 2
    }
    const direction = zoomable.split(',').map(d => d.trim()).filter(d => d).filter(d => d !== 'ne' || rotatable) // TODO: may be speed up

    return (
      <StyledRect
        ref={this.setElementRef}
        onMouseDown={this.startDrag}
        className="rect single-resizer"
        style={style}
      >

        {
          direction.map(d => {
            const cursor = ['ne', 'sw'].includes(d) ? { cursor: 'pointer' } : `${getCursor(rotateAngle + parentRotateAngle, d)}-resize`
            return (
              <div key={d} style={{ cursor }} className={`${zoomableMap[ d ]} resizable-handler`} {...this.getHandlerAttrs(d, cursor)} />
            )
          })
        }

        {
          direction.map(d => {
            return (
              <div key={d} className={`${zoomableMap[ d ]} square`} >{this.getCornerIcon(d)}</div>
            )
          })
        }
      </StyledRect>
    )
  }
}
