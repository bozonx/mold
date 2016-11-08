#  describe 'load(), load(num), load(subpath)', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'load() - check promise', ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      expect(this.collectionParam.load()).to.eventually
#      .property('coocked').deep.equal([testValues[0]])
#
#    it 'load() - check mold', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {id: 0, name: 'name0', $index: 0},
#        ])
#        .notify(done)
#
#    it 'load(0) - check promise', ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      expect(this.collectionParam.load(0)).to.eventually
#      .property('coocked').deep.equal(testValues[0])
#
#    it 'load(0) - check mold', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      expect(this.collectionParam.load(0)).to.eventually.notify =>
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([{id: 0, name: 'name0', $index: 0}])
#        .notify(done)
#
#    it 'load("0.name") - check promise', ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      expect(this.collectionParam.load('0.name')).to.eventually
#      .property('coocked').deep.equal(testValues[0].name)
#
#  describe 'unshift({...}), removeMold({...})', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'unshift() - check mold', ->
#      newItem = {name: 'name3'}
#      this.collectionParam.unshift(newItem)
#      assert.deepEqual(this.collectionParam.mold, [
#        {name: 'name3', $isNew: true, $index: 0},
#      ])
#
#    it 'unshift() - after load', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#
#      newItem = {name: 'name3'}
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.unshift(newItem)
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {name: 'name3', $isNew: true, $index: 0},
#          {id: 0, name: 'name0', $index: 1},
#        ])
#        .notify(done)
#
#    it 'removeMold() - after load', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', testValues)
#
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold({$index: 0})
#        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
#        .deep.equal([
#          {id: 1, name: 'name1', $index: 0},
#        ])
#        .notify(done)
#
#  describe 'save() added, save() removed', ->
#    beforeEach () ->
#      this.mold = mold( {}, testSchema() )
#      this.collectionParam = this.mold.instance('inMemory.collectionParam')
#
#    it 'save() added - check promise', ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually
#      .property(0).property('resp').property('coocked').deep.equal({id: 1, name: 'name3'})
#
#    it 'save() added - check memory', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually
#        .deep.equal({inMemory: {collectionParam: [
#          testValues[0],
#          {name: 'name3', id: 1}
#        ]}})
#        .notify(done)
#
#    it 'save() added - check unsaved', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0]])
#      this.collectionParam.unshift({name: 'name3'})
#
#      expect(this.collectionParam.save()).to.eventually.notify =>
#        expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually.notify =>
#          expect(Promise.resolve(this.collectionParam._main.state._request._addedUnsavedItems)).to.eventually
#          .deep.equal({})
#          .notify(done)
#
#    it 'save() removed - check memory', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', [testValues[0], testValues[1]])
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold(this.collectionParam.mold[0])
#
#        expect(this.collectionParam.save()).to.eventually.notify =>
#          expect(Promise.resolve(this.mold.schemaManager.$defaultMemoryDb)).to.eventually
#          .deep.equal({inMemory: {collectionParam: [testValues[1]]}})
#          .notify(done)
#
#    it 'save() removed - check unsaved', (done) ->
#      _.set(this.mold.schemaManager.$defaultMemoryDb, 'inMemory.collectionParam', testValues)
#      expect(this.collectionParam.load()).to.eventually.notify =>
#        this.collectionParam.removeMold(this.collectionParam.mold[0])
#
#        expect(this.collectionParam.save()).to.eventually.notify =>
#          expect(Promise.resolve(this.collectionParam._main.state._request._removedUnsavedItems)).to.eventually
#          .deep.equal({})
#          .notify(done)
#
