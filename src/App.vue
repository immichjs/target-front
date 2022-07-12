<script setup>
import { reactive, ref, onMounted, nextTick } from "vue";
import { $axios } from './config/axios'

let people = ref([])
const searchFilter = reactive({ option: 'id', text: '' })
let personObjectData = ref({})
const visibleTable = ref(true)
const roleOptions = ref('admin')
let toSaveData = ref(false)

const requestPeople = async () => people.value = await $axios.get('/people').then(({ data }) => data)

onMounted(() => requestPeople())

const requestCreatePerson = async () => {
  const { active, username, fullname, date } = personObjectData.value

  if (!username || !fullname || !date) {
    alert('Preencha todos os campos.')
    return
  }

  await $axios.post('/people', {
    ...personObjectData.value,
    active: active ? 'Y' : 'N',
    role: roleOptions.value
  }).then(() => alert('Criado com sucesso.'))

  await nextTick()
  personObjectData.value = {}
  requestPeople()
  changeVisibleTable()
}

const requestUpdatePerson = async () => {
  const { active, username, fullname, date, id } = personObjectData.value

  if (!username || !fullname || !date) {
    alert('Preencha todos os campos.')
    return
  }

  await $axios.patch(`/people/${id}`, {
    ...personObjectData.value,
    active: active ? 'Y' : 'N',
    role: roleOptions.value
  }).then(() => alert('Atualizado com sucesso.'))

  await nextTick()
  personObjectData.value = {}
  toSaveData.value = false
  requestPeople()
  changeVisibleTable()
}

const requestDeletePerson = async (id) => {
  const confirm = window.confirm('Tem certeza que deseja apagar este usuário?')
  if (!confirm) return 

  await $axios.delete(`/people/${id}`).then(() => alert('Deletado com sucesso.'))
  await nextTick()
  requestPeople()
}

const filteredPeople = () => {
  const { option, text } = searchFilter
  let values = people.value.filter(person => String(person[option]).toLowerCase().indexOf(text.toLowerCase()) > -1)
  if (!text) {
    requestPeople()
    return
  }

  people.value = values
}

const setUserToEdit = async (person) => {
  personObjectData.value = { ...person }
  await nextTick()
  toSaveData.value = true

  changeVisibleTable()
} 
const changeVisibleTable = () => visibleTable.value = !visibleTable.value
const cancelOperation = async () => {
  personObjectData.value = {}
  await nextTick()
  changeVisibleTable()
  requestPeople()
} 
</script>

<template>
  <nav class="navbar navbar-expand-lg bg-light p-4" v-if="visibleTable">
    <div class="container-xxl">
      <button type="button" class="btn btn-success" @click="changeVisibleTable">Add Record</button>
      <div>
        <form class="d-flex d-sm-flex" role="search">
          <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" v-model="searchFilter.text">
          <select class="form-select me-2" aria-label="Default select example" v-model="searchFilter.option">
            <option value="id">ID</option>
            <option value="username">Username</option>
            <option value="fullname">Fullname</option>
            <option value="date">Date</option>
          </select>
          <button class="btn btn-success" @click.prevent="filteredPeople">OK</button>
        </form>
      </div>
    </div>
  </nav>

  <div class="container-xxl mt-5" v-if="visibleTable">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Username</th>
          <th scope="col">Lastname</th>
          <th scope="col">Date</th>
          <th scope="col"></th>
          <th scope="col"></th>
        </tr>
      </thead>
      <template v-if="people.length">
        <tbody>
          <tr v-for="person in people" :key="person.id">
            <th scope="row">{{ person.id }}</th>
            <td>{{ person.username }}</td>
            <td>{{ person.fullname }}</td>
            <td>{{ person.date }}</td>
            <td class="text-center">
              <button type="button" class="btn btn-warning text-white" @click="setUserToEdit(person)">Edit</button>
            </td>
            <td class="text-center" @click="requestDeletePerson(person.id)">
              <button type="button" class="btn btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </template>
      <template v-else>
        <tbody>
          <tr>
            <td colspan="6" class="text-center">No records found</td>
          </tr>
        </tbody>
      </template>
    </table>
  </div>


  <nav class="bg-light p-4" v-if="!visibleTable">
    <div class="container-xxl">
      <button type="button" class="btn btn-success me-2" @click="!toSaveData ? requestCreatePerson() : requestUpdatePerson()">Save</button>
      <button class="btn btn-success" @click="cancelOperation()">Cancel</button>
    </div>
  </nav>

  <keep-alive>
    <div class="container-xxl" v-if="!visibleTable">
      <tr class="row p-1 border">
        <th class="col-2">ID</th>
        <td class="col">
          <input type="text" class="form-control my-3" placeholder="ID" aria-label="id" disabled v-model="personObjectData.id">
        </td>
      </tr>
      <tr class="row p-1 border">
        <th class="col-2">Username</th>
        <td class="col">
          <input type="text" class="form-control my-3" placeholder="Username" aria-label="username" v-model="personObjectData.username">
        </td>
      </tr>
      <tr class="row p-1 border">
        <th class="col-2">Fullname</th>
        <td class="col">
          <input type="text" class="form-control my-3" placeholder="Fullname" aria-label="fullname" v-model="personObjectData.fullname">
        </td>
      </tr>
      <tr class="row p-1 border">
        <th class="col-2">Date</th>
        <td class="col">
          <input type="text" class="form-control my-3" placeholder="Date (xxxx-xxxx)" aria-label="date" v-model="personObjectData.date">
        </td>
      </tr>
      <tr class="row p-1 border">
        <th class="col-2">Country</th>
        <td class="col">
          <div class="form-check my-3">
            <input class="form-check-input" type="checkbox" id="activePerson" v-model="personObjectData.active">
            <label class="form-check-label" for="activePerson">
              Active
            </label>
          </div>
        </td>
      </tr>
      <tr class="row p-1 border">
        <th class="col-2">Role</th>
        <td class="col">
          <select class="form-select my-3" aria-label="Default select example" v-model="roleOptions">
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </td>
      </tr>
    </div>
  </keep-alive>
</template>

