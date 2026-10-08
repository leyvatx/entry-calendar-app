import { useEffect, useRef, useState } from 'react'
import { Flex, Grid, Pagination, Table, theme } from 'antd'

export default function DataTable({ dataSource, pageSize = 20, ...tableProps }) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const scrollRef = useRef(null)
  const [page, setPage] = useState(1)
  const [overflowing, setOverflowing] = useState(false)
  const current = Math.min(page, Math.max(1, Math.ceil(dataSource.length / pageSize)))
  const rows = dataSource.slice((current - 1) * pageSize, current * pageSize)

  useEffect(() => {
    const scroller = scrollRef.current
    const observer = new ResizeObserver(() => setOverflowing(scroller.scrollHeight - scroller.clientHeight > 2))
    observer.observe(scroller)
    observer.observe(scroller.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return (
    <Flex
      vertical
      style={{
        minHeight: 0, overflow: 'hidden', background: token.colorBgContainer,
        border: `${token.lineWidth}px solid ${token.colorSplit}`, borderRadius: token.borderRadiusLG,
      }}
    >
      <div ref={scrollRef} style={{ minHeight: 0, overflowX: 'auto', overflowY: overflowing ? 'auto' : 'hidden' }}>
        <Table
          {...tableProps}
          dataSource={rows}
          pagination={false}
          sticky={{ getContainer: () => scrollRef.current }}
        />
      </div>
      <Pagination
        align="end"
        size={screens.md ? 'medium' : 'small'}
        current={current}
        pageSize={pageSize}
        total={dataSource.length}
        showSizeChanger={false}
        showTotal={(total, [from, to]) => `${from}–${to} de ${total} registros`}
        onChange={(next) => {
          setPage(next)
          scrollRef.current?.scrollTo({ top: 0 })
        }}
        style={{ padding: token.paddingSM, borderBlockStart: `${token.lineWidth}px solid ${token.colorSplit}` }}
      />
    </Flex>
  )
}
