import { TableContainer, TableWithBorder, Td, Th } from 'components/Table'

import { Title2 } from '.'

export default function TransactionTable() {
  return (
    <>
      <Title2 style={{ marginBottom: '13px' }}>Latest Transaction Table</Title2>
      <TableContainer>
        <TableWithBorder>
          <thead>
            <tr>
              <Th>User Address</Th>
              <Th>Input Token</Th>
              <Th>Output Token</Th>
              <Th>Amount</Th>
              <Th>Referrer address</Th>
              <Th>Value Earned</Th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((position, index) => (
              <tr
                key={position}
                style={{
                  backgroundColor: index % 2 !== 0 ? 'rgba(30, 26, 34, 1)' : 'rgba(19, 19, 19, 1)',
                }}
              >
                <Td>0x8171...6bca</Td>
                <Td>ETH</Td>
                <Td>DAI</Td>
                <Td>100</Td>
                <Td>0x1234...abcd</Td>
                <Td>$50</Td>
              </tr>
            ))}
          </tbody>
        </TableWithBorder>
      </TableContainer>
    </>
  )
}
