import { gql } from 'apollo-server';

export default gql`
"""
A single room in the general Cube 
"""
type Cube {
  uid: ID
  label: String
  color: String
  x: Int
  y: Int
  z: Int
  items: [Item]
  neighbours: [Cube]
}

"""
Items in a room
"""
type Item {
  itemUid: ID
  type: String
  label: String
  content: String
  refs: [Item]
}

type Query {
  cubes(id: ID): [Cube]
  pathTo(startId: ID, targetId: ID): [Cube]
  connectedOverItem(itemId: ID): [Cube]
}
`;


