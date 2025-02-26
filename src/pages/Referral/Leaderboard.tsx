import { ButtonSecondary } from 'components/Button'
import { TableContainer, TableWithBorder, Td, Th } from 'components/Table'
import { Award } from 'react-feather'

import { Title2 } from '.'

export default function Leaderboard() {
  return (
    <>
      <Title2 style={{ marginBottom: '10px', marginTop: '10px' }}>Leaderboards</Title2>
      <TableContainer>
        <TableWithBorder>
          <thead style={{}}>
            <tr style={{}}>
              <Th>#</Th>
              <Th>User</Th>
              <Th># of Referrals</Th>
              <Th>Volume Generated</Th>
              <Th>Points</Th>
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
                <Td>{position}</Td>
                <Td>0x8171...6bca</Td>
                <Td>51</Td>
                <Td>$45,231</Td>
                <Td>565</Td>
              </tr>
            ))}
          </tbody>
        </TableWithBorder>
      </TableContainer>{' '}
      <div style={{ display: 'flex', justifyContent: 'center', width: 'fit', marginTop: '20px' }}>
        <ButtonSecondary
          style={{
            width: '210px',
            gap: '8px',
            color: 'white',
            fontWeight: 600,
            borderRadius: '10px',
            padding: '10px 0',
          }}
        >
          <Award size={20} />
          See Full Leaderboard
        </ButtonSecondary>
      </div>
    </>
  )
}
