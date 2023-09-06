import styled from 'styled-components'

export default styled.div`
  position: absolute;
  border: 1px solid #eb5648;

  .square {
    position: absolute;
    width: 26px;
    height: 26px;
    background: #eb5648;
    border: 1px solid #eb5648;
    border-radius: 50%;
    text-align: center;
    line-height: 26px;
  }

  .resizable-handler {
    position: absolute;
    width: 26px;
    height: 26px;
    cursor: pointer;
    z-index: 1;

    &.tl,
    &.t,
    &.tr {
      top: -12px;
    }

    &.tl,
    &.l,
    &.bl {
      left: -12px;
    }

    &.bl,
    &.b,
    &.br {
      bottom: -12px;
    }

    &.br,
    &.r,
    &.tr {
      right: -12px;
    }

    &.l,
    &.r {
      margin-top: -12px;
    }

    &.t,
    &.b {
      margin-left: -12px;
    }
  }

  .rotate {
    position: absolute;
    left: 50%;
    top: -26px;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .t,
  .tl,
  .tr {
    top: -12px;
  }

  .b,
  .bl,
  .br {
    bottom: -12px;
  }

  .r,
  .tr,
  .br {
    right: -12px;
  }

  .tl,
  .l,
  .bl {
    left: -12px;
  }

  .l,
  .r {
    top: 50%;
    margin-top: -12px;
  }

  .t,
  .b {
    left: 50%;
    margin-left: -12px;
  }
`
