import { useEffect, useState } from "react";
import { getAdminUsers } from "../../services/admin/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : data.users || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;

  if (error) return <p>{error}</p>;

  return (
    <section>
      <div className="admin-page-header">
        <h1>👥 Usuarios</h1>
        <p>Lista de usuarios registrados en la plataforma.</p>
      </div>

      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID Interno</th>
              <th>ID Público</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Monedas</th>
              <th>Fecha registro</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-empty">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>

                  <td>
                    <span className="public-id-badge">
                      {user.public_id || "00000000"}
                    </span>
                  </td>

                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.coins ?? 0}</td>

                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
