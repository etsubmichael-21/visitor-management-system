using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcxVisitorManagement.DTOs.Common;
using EcxVisitorManagement.DTOs.Visits;
using EcxVisitorManagement.Interfaces;

namespace EcxVisitorManagement.Controllers;

[ApiController]
[Route("api/visits")]
[Authorize]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService) => _visitService = visitService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PageRequest request)
    {
        var result = await _visitService.GetAllAsync(request);
        return Ok(ApiResponse<PagedResponse<VisitResponseDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _visitService.GetByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<VisitResponseDto>.NotFound("Visit not found"));
        return Ok(ApiResponse<VisitResponseDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] VisitCreateDto dto)
    {
        var result = await _visitService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<VisitResponseDto>.Created(result));
    }

    [HttpPost("check-in")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInRequest request)
    {
        try
        {
            var result = await _visitService.CheckInAsync(request);
            return Ok(ApiResponse<VisitResponseDto>.Ok(result, "Check-in successful"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<VisitResponseDto>.BadRequest(ex.Message));
        }
    }

    [HttpPost("{id}/check-out")]
    public async Task<IActionResult> CheckOut(int id, [FromBody] CheckOutRequest request)
    {
        try
        {
            var result = await _visitService.CheckOutAsync(id, request);
            return Ok(ApiResponse<VisitResponseDto>.Ok(result, "Check-out successful"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<VisitResponseDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<VisitResponseDto>.BadRequest(ex.Message));
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            var result = await _visitService.CancelAsync(id);
            return Ok(ApiResponse<VisitResponseDto>.Ok(result, "Visit cancelled"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<VisitResponseDto>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<VisitResponseDto>.BadRequest(ex.Message));
        }
    }

    [HttpGet("by-visitor/{visitorId}")]
    public async Task<IActionResult> GetByVisitor(int visitorId)
    {
        var result = await _visitService.GetByVisitorAsync(visitorId);
        return Ok(ApiResponse<IReadOnlyList<VisitResponseDto>>.Ok(result));
    }

    [HttpGet("by-employee/{employeeId}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var result = await _visitService.GetByEmployeeAsync(employeeId);
        return Ok(ApiResponse<IReadOnlyList<VisitResponseDto>>.Ok(result));
    }

    [HttpGet("today")]
    public async Task<IActionResult> GetToday()
    {
        var result = await _visitService.GetTodayVisitsAsync();
        return Ok(ApiResponse<IReadOnlyList<VisitResponseDto>>.Ok(result));
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _visitService.GetActiveVisitsAsync();
        return Ok(ApiResponse<IReadOnlyList<VisitResponseDto>>.Ok(result));
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItems(int id, [FromBody] List<VisitorItemCreateDto> items)
    {
        try
        {
            var result = await _visitService.AddItemsAsync(id, items);
            return Ok(ApiResponse<IReadOnlyList<VisitorItemDto>>.Ok(result, "Items added"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<VisitorItemDto>>.NotFound(ex.Message)); }
    }

    [HttpPost("{id}/items/verify")]
    public async Task<IActionResult> VerifyItems(int id, [FromBody] List<ItemVerificationDto> verifications)
    {
        try
        {
            var result = await _visitService.VerifyItemsAsync(id, verifications);
            return Ok(ApiResponse<IReadOnlyList<VisitorItemDto>>.Ok(result, "Items verified"));
        }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<IReadOnlyList<VisitorItemDto>>.NotFound(ex.Message)); }
    }
}
